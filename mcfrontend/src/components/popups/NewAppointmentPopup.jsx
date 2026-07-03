import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, ChevronRight, Search, Check, Plus, Activity } from 'lucide-react';
import axiosInstance from '../../utils/axioInstance';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

// Use your specific publishable key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51TJt3D7VH3DAzxbI4qH8QugOjXyo9BZJC9h8DkuKzk505QwQjoEfdDiVGAxU4Oo5gKiHZGMfej2vxRR2eTxHQkPL00QovOI3wd');

export default function NewAppointmentPopup({ onClose }) {
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        patientPhone: '',
        patientAge: '',
        doctorId: '',
        doctorName: '',
        specialization: '',
        date: '',
        timeSlot: '',
        paymentMethod: 'Stripe',
    });

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const isAdmin = userInfo.role === 'admin';
    const isPatient = userInfo.role === 'patient';

    useEffect(() => {
        // If patient is booking, pre-fill with their own info if available
        if (isPatient && userInfo) {
            setFormData(prev => ({
                ...prev,
                patientName: userInfo.name || '',
                patientPhone: userInfo.contact || '', // This might be in profile, but we'll try
                patientAge: userInfo.age || ''
            }));

            // Try to find patient profile to get phone/age
            const fetchOwnProfile = async () => {
                try {
                    const res = await axiosInstance.get('/patients/me');
                    if (res.data) {
                        setFormData(prev => ({
                            ...prev,
                            patientPhone: res.data.contact || prev.patientPhone,
                            patientAge: res.data.age || prev.patientAge,
                            patientId: res.data._id
                        }));
                    }
                } catch (err) {
                    console.warn("Could not fetch own profile", err);
                }
            };
            fetchOwnProfile();
        }
    }, [isPatient]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const promises = [axiosInstance.get('/doctors')];
                if (isAdmin) {
                    promises.push(axiosInstance.get('/patients'));
                }

                const [docsRes, patientsRes] = await Promise.all(promises);
                setDoctors(docsRes.data.filter(doc => doc.user));
                if (isAdmin && patientsRes) {
                    setPatients(patientsRes.data.filter(p => p.user));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [isAdmin]);

    const handleDoctorChange = (e) => {
        const docId = e.target.value;
        const selectedDoc = doctors.find(d => d._id === docId);
        if (selectedDoc) {
            setFormData({
                ...formData,
                doctorId: docId,
                doctorName: selectedDoc.user?.name || 'Unknown Doctor',
                specialization: selectedDoc.specialization
            });
        }
    };

    const handlePatientChange = (e) => {
        const pId = e.target.value;
        const selectedPatient = patients.find(p => p._id === pId);
        if (selectedPatient) {
            setFormData({
                ...formData,
                patientId: pId,
                patientName: selectedPatient.user?.name || '',
                patientPhone: selectedPatient.contact || '',
                patientAge: selectedPatient.age || ''
            });
        }
    };

    const handleStripePayment = async () => {
        if (!formData.doctorId || !formData.patientName || !formData.date || !formData.timeSlot) {
            toast.error("Please fill in all appointment details first.");
            return;
        }

        setIsLoading(true);
        try {
            const currentUrl = window.location.origin + window.location.pathname;
            const response = await axiosInstance.post('/payments/create-checkout-session', {
                appointmentData: {
                    ...formData,
                    amount: 1500,
                },
                successUrl: `${currentUrl}?success=true`,
                cancelUrl: `${currentUrl}?canceled=true`
            });

            if (response.data.url) {
                sessionStorage.setItem('pendingAppointment', JSON.stringify(formData));
                window.location.href = response.data.url;
            } else {
                toast.error("Failed to create checkout session.");
            }
        } catch (error) {
            console.error('Stripe session creation failed:', error);
            const errorMsg = error.response?.data?.message || "Stripe service unavailable. Please try again later.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDirectConfirm = async () => {
        if (!formData.doctorId || !formData.patientName || !formData.date || !formData.timeSlot) {
            toast.error("Please fill in all appointment details first.");
            return;
        }

        setIsLoading(true);
        try {
            await axiosInstance.post('/appointments', {
                ...formData,
                status: 'Scheduled',
                paymentStatus: 'paid',
                paymentMethod: 'Direct (Admin)',
                totalAmount: 1500
            });
            toast.success("Appointment confirmed successfully!");
            onClose();
        } catch (error) {
            console.error('Direct confirm failed:', error);
            toast.error(error.response?.data?.message || "Failed to confirm appointment.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="relative border-b border-slate-100 p-6 bg-slate-50/50">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <img src={logo} alt="Logo" className="h-14 w-auto drop-shadow-sm" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">New Appointment</h2>
                                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Schedule a medical consultation</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-slate-600 shadow-sm border border-transparent hover:border-slate-100">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-8">
                        {/* Patient Information */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Patient Information</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                    {isAdmin ? (
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] appearance-none transition-all shadow-sm"
                                            value={formData.patientId}
                                            onChange={handlePatientChange}
                                            required
                                        >
                                            <option value="">Select a registered patient</option>
                                            {patients
                                                .filter(p => !p.user?.isDisabled)
                                                .map(p => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.user?.name || 'Unknown Patient'}
                                                    </option>
                                                ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all shadow-sm"
                                            placeholder="Enter patient full name"
                                            value={formData.patientName}
                                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                            required
                                        />
                                    )}
                                    {isAdmin && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Age</label>
                                    <div className="relative group">
                                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] transition-all shadow-sm"
                                            placeholder="Ex: 25"
                                            value={formData.patientAge}
                                            onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                        <input
                                            type="tel"
                                            className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] transition-all shadow-sm ${isAdmin && 'cursor-not-allowed opacity-70'}`}
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.patientPhone}
                                            onChange={(e) => !isAdmin && setFormData({ ...formData, patientPhone: e.target.value })}
                                            readOnly={isAdmin}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Doctor Selection Section */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Medical Specialist</h3>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all shadow-sm"
                                    placeholder="Search by name or clinical specialty..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-h-[260px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                {doctors
                                    .filter(doc =>
                                        !doc.user?.isDisabled && (
                                            (doc.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                    )
                                    .map(doc => (
                                        <div
                                            key={doc._id}
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    doctorId: doc._id,
                                                    doctorName: doc.user?.name || 'Unknown Doctor',
                                                    specialization: doc.specialization
                                                });
                                            }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${formData.doctorId === doc._id
                                                ? 'bg-[#1c6b64]/5/50 border-[#1c6b64] shadow-md ring-1 ring-[#1c6b64]/20'
                                                : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-[#1c6b64]/5/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${formData.doctorId === doc._id ? 'bg-[#1c6b64] text-white border-transparent' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-white'
                                                    }`}>
                                                    {doc.user?.name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm tracking-tight ${formData.doctorId === doc._id ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        Dr. {doc.user?.name || 'Unknown'}
                                                    </p>
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider ${formData.doctorId === doc._id ? 'text-[#1c6b64]' : 'text-slate-400'}`}>
                                                        {doc.specialization || 'Clinical Specialist'}
                                                    </p>
                                                </div>
                                            </div>
                                            {formData.doctorId === doc._id ? (
                                                <div className="w-6 h-6 bg-[#1c6b64] rounded-full flex items-center justify-center shadow-sm">
                                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                {doctors.length === 0 && (
                                    <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs font-bold italic tracking-wider">No medical specialists found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Schedule Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Selected Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] transition-all shadow-sm"
                                            value={formData.date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Time Slot</label>
                                    <div className="relative group">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pl-11 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] appearance-none transition-all shadow-sm"
                                            value={formData.timeSlot}
                                            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                                            required
                                        >
                                            <option value="">Select time</option>
                                            <option value="09:00">09:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="14:00">02:00 PM</option>
                                            <option value="15:00">03:00 PM</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fee Breakdown (only for Patients) */}
                        {!isAdmin && (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospital Fee</span>
                                    <span className="text-slate-700 font-medium text-sm">Rs. 249.90</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Fee</span>
                                    <span className="text-slate-700 font-medium text-sm">Rs. 1,249.52</span>
                                </div>
                                <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center">
                                    <span className="text-slate-900 font-bold text-xs uppercase tracking-wider">Total Payable</span>
                                    <span className="text-[#1c6b64] font-bold text-lg">Rs. 1,500.00</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] hover:bg-white transition-all active:scale-95 shadow-sm"
                    >
                        Discard
                    </button>
                    <button
                        type="button"
                        onClick={isAdmin ? handleDirectConfirm : handleStripePayment}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3.5 rounded-2xl bg-[#1c6b64] hover:bg-[#15514b] text-white font-bold uppercase tracking-wider text-[10px] transition-all shadow-lg shadow-[#1c6b64]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isAdmin ? 'Schedule Session' : 'Proceed to Payment'}
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    LogOut,
    Plus,
    Search,
    Stethoscope,
    UserCog,
    RefreshCw
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NewAppointmentPopup from '../../components/popups/NewAppointmentPopup';
import axiosInstance from '../../utils/axioInstance';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

import toast from 'react-hot-toast';

export default function AllAppointments() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('All');

    const [showNewAppointmentPopup, setShowNewAppointmentPopup] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axiosInstance.get('/doctors');
            setDoctors(res.data.filter(doc => !doc.user?.isDisabled));
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axiosInstance.get('/appointments');
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
        fetchAppointments();
    }, []);

    // Handle Stripe Success Redirect for Admin
    useEffect(() => {
        const success = searchParams.get('success');
        const pendingData = sessionStorage.getItem('pendingAppointment');

        if (success === 'true' && pendingData) {
            const appointmentData = JSON.parse(pendingData);
            
            const confirmAndSave = async () => {
                try {
                    toast.loading("Processing appointment payment...", { id: 'admin-payment' });
                    await axiosInstance.post('/appointments', {
                        ...appointmentData,
                        status: 'Scheduled',
                        paymentStatus: 'paid'
                    });
                    toast.success("Appointment successfully saved and verified!", { id: 'admin-payment' });
                    sessionStorage.removeItem('pendingAppointment');
                    // Clean URL
                    navigate('/admin/appointments', { replace: true });
                    fetchAppointments();
                } catch (err) {
                    console.error('Admin save failed:', err);
                    toast.error("Error finalizing appointment. Please check database logs.", { id: 'admin-payment' });
                }
            };
            confirmAndSave();
        }
    }, [searchParams, navigate]);

    const filteredAppointments = appointments.filter(appt => {
        const pName = appt.patient?.user?.name || appt.patientName || '';
        const dName = appt.doctor?.user?.name || appt.doctorName || '';
        
        const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDoctor = doctorFilter === 'All' || dName === doctorFilter;

        return matchesSearch && matchesDoctor;
    });

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Appointments" 
                    subtitle="Manage schedule, statuses, and patient bookings."
                    userName={user?.name || 'Administrator'}
                    roleLabel="ADMIN"
                />

                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                        </div>
                        <button
                            onClick={() => setShowNewAppointmentPopup(true)}
                            className="bg-[#1c6b64] hover:bg-[#15514b] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-[#1c6b64]/20 active:scale-95"
                        >
                            <Plus size={18} /> New Appointment
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by patient or doctor..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-3 outline-none transition-all shadow-sm min-w-[150px]"
                                value={doctorFilter}
                                onChange={(e) => setDoctorFilter(e.target.value)}
                            >
                                <option value="All">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc._id} value={doc.user?.name}>
                                        {doc.user?.name || 'Unknown'}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Patient Name</th>
                                        <th className="px-6 py-4">Doctor</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Hospital Service</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredAppointments.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No records found.</td></tr>
                                    ) : (
                                        filteredAppointments.map(appt => (
                                            <AppointmentRow key={appt._id} appt={appt} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            {showNewAppointmentPopup && <NewAppointmentPopup onClose={() => { setShowNewAppointmentPopup(false); fetchAppointments(); }} />}
        </div>
    );
}

function AppointmentRow({ appt }) {
    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-5">
                <p className="text-slate-900 font-bold text-sm">{appt.patient?.user?.name || appt.patientName || 'N/A'}</p>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <UserCog size={16} className="text-slate-400" />
                    <span>{appt.doctor?.user?.name || appt.doctorName || 'N/A'}</span>
                </div>
            </td>
            <td className="px-6 py-5 text-slate-600">
                <p className="text-slate-900 text-sm font-semibold">{new Date(appt.date).toLocaleDateString()}</p>
            </td>
            <td className="px-6 py-5">
                <p className="text-slate-500 text-[10px] uppercase font-bold">{appt.timeSlot}</p>
            </td>
            <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1c6b64]/5 text-[#1c6b64] border border-[#1c6b64]/10">
                    {appt.service?.name || appt.doctor?.specialization || 'Consultation'}
                </span>
            </td>
        </tr>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NewAppointmentPopup from '../../components/popups/NewAppointmentPopup';
import axiosInstance from '../../utils/axioInstance';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import {
    Plus,
    Search,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    Clock3
} from 'lucide-react';

export default function PatientAppointments() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showNewPopup, setShowNewPopup] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
    const patientName = userInfo.name || 'Patient';

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/appointments');
            // Backend should return appointments for the logged-in user if token is provided
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error("Failed to load appointments.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Handle Stripe Success Redirect
    const hasSaved = React.useRef(false);

    useEffect(() => {
        const success = searchParams.get('success');
        const pendingData = sessionStorage.getItem('pendingAppointment');

        if (success === 'true' && pendingData && !hasSaved.current) {
            hasSaved.current = true;
            const appointmentData = JSON.parse(pendingData);

            const confirmAndSave = async () => {
                try {
                    // Remove item immediately to prevent other triggers
                    sessionStorage.removeItem('pendingAppointment');

                    toast.loading("Confirming your payment...", { id: 'payment-confirm' });
                    await axiosInstance.post('/appointments', {
                        ...appointmentData,
                        status: 'Scheduled',
                        paymentStatus: 'paid'
                    });
                    toast.success("Appointment successfully booked and paid!", { id: 'payment-confirm' });

                    // Remove the success param from URL
                    navigate('/patient/appointments', { replace: true });
                    fetchAppointments();
                } catch (err) {
                    console.error('Final save failed:', err);
                    toast.error("encountered an error saving details. Please contact support.", { id: 'payment-confirm' });
                }
            };
            confirmAndSave();
        }
    }, [searchParams, navigate]);

    const upcomingAppointments = appointments.filter(appt => {
        const isScheduled = appt.status === 'Scheduled' || appt.status === 'confirmed';
        if (!isScheduled) return false;

        if (!appt.date || !appt.timeSlot) return true;

        try {
            const [year, month, day] = appt.date.split('T')[0].split('-').map(Number);
            const [hours, minutes] = appt.timeSlot.split(':').map(Number);
            const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
            return appointmentDateTime >= new Date();
        } catch (e) {
            return true;
        }
    });

    const pastAppointments = appointments.filter(appt => {
        const isPastStatus = appt.status === 'completed' || appt.status === 'rejected';
        if (isPastStatus) return true;

        const isScheduled = appt.status === 'Scheduled' || appt.status === 'confirmed';
        if (!isScheduled) return false;

        if (!appt.date || !appt.timeSlot) return false;

        try {
            const [year, month, day] = appt.date.split('T')[0].split('-').map(Number);
            const [hours, minutes] = appt.timeSlot.split(':').map(Number);
            const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
            return appointmentDateTime < new Date();
        } catch (e) {
            return false;
        }
    });

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="patient" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title="Appointments"
                    subtitle="View and manage your scheduled healthcare visits."
                    userName={patientName}
                    roleLabel="Patient"
                />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        {/* Book New Appointment Button */}
                        <button
                            onClick={() => setShowNewPopup(true)}
                            className="flex items-center gap-2 bg-[#1c6b64] hover:bg-[#15514b] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-[#1c6b64]/20"
                        >
                            <Plus size={22} strokeWidth={2} />
                            Book New Appointment
                        </button>


                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Appointments */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
                                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                         <div className="p-2 bg-[#1c6b64]/10 text-[#1c6b64] rounded-xl border border-[#1c6b64]/20 shadow-sm shadow-[#1c6b64]/5">
                                             <Calendar size={18} strokeWidth={2.5} />
                                         </div>
                                         <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Appointments</h2>
                                     </div>
                                     <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#1c6b64]/10 text-[#1c6b64] border border-[#1c6b64]/20 shadow-sm shadow-[#1c6b64]/5">
                                         <span className="w-1.5 h-1.5 rounded-full bg-[#1c6b64] animate-pulse"></span>
                                         {upcomingAppointments.length} Active
                                     </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Doctor</th>
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Specialization</th>
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Schedule</th>
                                                <th className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {upcomingAppointments.length > 0 ? (
                                                upcomingAppointments.map((appt) => (
                                                    <tr key={appt._id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="py-4 px-6">
                                                             <div className="flex items-center gap-3">
                                                                 <div className="w-9 h-9 rounded-xl bg-[#1c6b64]/10 flex items-center justify-center text-[#1c6b64] font-black text-xs border border-[#1c6b64]/20 shadow-sm shadow-[#1c6b64]/5">
                                                                     {appt.doctor?.user?.name?.charAt(0) || 'D'}
                                                                 </div>
                                                                 <p className="text-sm font-black text-slate-900 group-hover:text-[#1c6b64] transition-colors">
                                                                     Dr. {appt.doctor?.user?.name || 'Loading...'}
                                                                 </p>
                                                             </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm text-slate-500">{appt.doctor?.specialization || 'General Consultation'}</span>
                                                        </td>
                                                        <td className="py-5 px-6">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
                                                                    <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-[#1c6b64]/10 transition-colors">
                                                                        <Calendar size={14} className="text-[#1c6b64]" />
                                                                    </div>
                                                                    {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </div>
                                                                <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-800">
                                                                    <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-[#1c6b64]/10 transition-colors">
                                                                        <Clock size={12} className="text-[#1c6b64]" strokeWidth={2.5} />
                                                                    </div>
                                                                    {appt.timeSlot}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-5 px-6 text-center">
                                                            <div className="flex justify-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#1c6b64]/10 text-[#1c6b64] border border-[#1c6b64]/20 shadow-sm shadow-[#1c6b64]/5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c6b64] animate-pulse"></span>
                                                                    {appt.status === 'Scheduled' || appt.status === 'confirmed' ? 'Scheduled' : appt.status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                                            <Calendar size={40} className="mb-3 opacity-20" />
                                                            <p className="text-sm">No upcoming appointments found.</p>
                                                            <button
                                                                onClick={() => setShowNewPopup(true)}
                                                                className="mt-4 text-emerald-600 hover:text-emerald-500 text-sm font-medium underline underline-offset-4"
                                                            >
                                                                Book your first visit
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Past Appointments */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg">
                                            <Clock3 className="text-slate-400" size={20} />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Past Appointments</h2>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-full border border-slate-100">
                                        {pastAppointments.length} History
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Doctor</th>
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Specialization</th>
                                                <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Date</th>
                                                <th className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {pastAppointments.length > 0 ? (
                                                pastAppointments.map((appt) => (
                                                    <tr key={appt._id} className="opacity-70 hover:opacity-100 transition-all">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 text-xs border border-slate-200">
                                                                    {appt.doctor?.user?.name?.charAt(0) || 'D'}
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-700">
                                                                    Dr. {appt.doctor?.user?.name || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm text-slate-500">{appt.doctor?.specialization || 'General Consultation'}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm text-slate-500">
                                                                {new Date(appt.date).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${appt.status === 'completed'
                                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                    : appt.status === 'rejected'
                                                                        ? 'bg-red-50 text-red-600 border-red-100'
                                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                                }`}>
                                                                {appt.status === 'Scheduled' || appt.status === 'confirmed' ? 'Passed' : appt.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-center text-slate-400 text-sm">
                                                        No history found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                </main>

                {showNewPopup && (
                    <NewAppointmentPopup onClose={() => setShowNewPopup(false)} />
                )}
            </div>
        </div>
    );
}

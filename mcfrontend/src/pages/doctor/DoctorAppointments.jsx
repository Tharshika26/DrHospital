import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axioInstance';
import {
    LayoutDashboard,
    Calendar,
    Users,
    CalendarClock,
    User,
    LogOut,
    Plus,
    Settings,
    Search,
    Filter,
    Eye,
    Edit,
    ChevronDown,
    RefreshCw,
    CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ClinicalConditionPopup from '../../components/popups/ClinicalConditionPopup';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function DoctorAppointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [showConditionPopup, setShowConditionPopup] = useState(false);
    const [doctorName, setDoctorName] = useState('Doctor');

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/appointments');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const formatted = res.data.map(apt => {
                // Determine if date has passed
                const apptDate = new Date(apt.date);
                apptDate.setHours(0, 0, 0, 0);
                
                const isPastDate = today > apptDate;
                
                // Status mapping: manually completed OR the date has strictly passed
                const isStatusCompleted = apt.status?.toLowerCase() === 'completed';
                const status = (isStatusCompleted || isPastDate) ? 'Completed' : 'Upcoming';
                
                // Both use theme green (#1c6b64), but Upcoming is more subtle
                const statusColor = status === 'Completed' 
                    ? 'bg-[#1c6b64]/20 text-[#1c6b64] border border-[#1c6b64]/30' 
                    : 'bg-[#1c6b64]/5 text-[#1c6b64]/70 border border-[#1c6b64]/10';

                return {
                    id: apt._id,
                    name: apt.patient?.user?.name || "Unknown Patient",
                    date: new Date(apt.date).toLocaleDateString(),
                    rawDate: apt.date,
                    time: apt.timeSlot,
                    clinicalCondition: apt.clinicalCondition || "",
                    status,
                    statusColor
                };
            });
            setAppointments(formatted);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const fetchDoctor = async () => {
            try {
                const res = await axiosInstance.get('/doctors/me');
                if (res.data && res.data.user) setDoctorName(res.data.user.name);
            } catch (err) {}
        };
        fetchDoctor();
    }, []);

    const handleComplete = async (id) => {
        try {
            await axiosInstance.put(`/appointments/${id}/complete`);
            toast.success("Appointment marked as complete");
            fetchAppointments();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleSaveCondition = async (condition) => {
        if (!selectedAppt) return;
        try {
            await axiosInstance.put(`/appointments/${selectedAppt.id}/condition`, { clinicalCondition: condition });
            toast.success("Clinical condition saved");
            setShowConditionPopup(false);
            fetchAppointments();
        } catch (err) {
            toast.error("Failed to save condition");
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || apt.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="doctor" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Appointments" 
                    subtitle="Manage and view all your patient appointments."
                    userName={doctorName}
                    roleLabel="Doctor"
                />

                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Search Bar Row */}
                        <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by patient name..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors placeholder-slate-400 scheme-light"
                                    placeholder="mm/dd/yyyy"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Filter size={18} />
                                </div>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-4 py-2.5 text-slate-800 text-sm outline-none appearance-none cursor-pointer"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Upcoming">Upcoming</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Patient Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Clinical Condition</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No appointments found.</td>
                                        </tr>
                                    ) : (
                                        filteredAppointments.map(apt => (
                                            <AppointmentRow
                                                key={apt.id}
                                                {...apt}
                                                onEditCondition={() => {
                                                    setSelectedAppt(apt);
                                                    setShowConditionPopup(true);
                                                }}
                                                onComplete={() => handleComplete(apt.id)}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {showConditionPopup && (
                <ClinicalConditionPopup
                    initialCondition={selectedAppt?.clinicalCondition || ''}
                    patientName={selectedAppt?.name}
                    onClose={() => setShowConditionPopup(false)}
                    onSave={handleSaveCondition}
                />
            )}
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active }) {
    return (
        <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${active
            ? 'bg-[#0a5f47]/40 text-[#1c6b64] font-medium border border-[#1c6b64]/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}>
            <Icon size={20} className={active ? 'text-[#1c6b64]' : ''} />
            <span>{label}</span>
        </div>
    );
}

function AppointmentRow({ name, date, rawDate, time, clinicalCondition, status, statusColor, onEditCondition, onComplete }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const isTimePassed = () => {
        if (!rawDate || !time) return false;
        
        const apptDate = new Date(rawDate);
        // time is format "HH:mm"
        const [hours, minutes] = time.split(':').map(Number);
        
        // Use a new date object for comparison to avoid mutating
        const comparisonDate = new Date(apptDate);
        comparisonDate.setHours(hours, minutes, 0, 0);
        
        return currentTime >= comparisonDate;
    };

    const hasPassed = isTimePassed();

    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-5 font-bold text-slate-900">{name}</td>
            <td className="px-6 py-5 text-slate-600">{date}</td>
            <td className="px-6 py-5 text-slate-600">{time}</td>
            <td className="px-6 py-5 text-slate-600">
                <div className="flex items-center gap-2">
                    {clinicalCondition ? (
                        <>
                            <div className="max-w-[150px]">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1c6b64]/5 text-[#1c6b64] border border-[#1c6b64]/10 wrap-anywhere line-clamp-1">
                                    {clinicalCondition}
                                </span>
                            </div>
                            <button
                                onClick={onEditCondition}
                                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-[#1c6b64] px-3 py-1 rounded-full text-[10px] font-bold transition-all border border-[#1c6b64]/10"
                                title="Edit Condition"
                            >
                                <Edit size={12} />
                                <span>Edit</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onEditCondition}
                            className="inline-flex items-center gap-1.5 bg-[#1c6b64]/5 hover:bg-[#1c6b64]/10 text-[#1c6b64] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1c6b64]/10 transition-all active:scale-95"
                        >
                            <Plus size={14} strokeWidth={3} />
                            <span>Add</span>
                        </button>
                    )}
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                        {status}
                    </span>
                    {status === 'Upcoming' && (
                        <button
                            onClick={onComplete}
                            disabled={!hasPassed}
                            title={!hasPassed ? "Cannot complete before appointment time" : "Mark as complete"}
                            className={`flex items-center gap-1.5 px-3 py-1 transition-all duration-200 rounded-lg text-xs font-bold ${
                                hasPassed 
                                    ? 'bg-[#1c6b64] hover:bg-[#15514b] text-white shadow-lg shadow-[#1c6b64]/20 shadow-emerald-500/10' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <CheckCircle size={14} />
                            Complete
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

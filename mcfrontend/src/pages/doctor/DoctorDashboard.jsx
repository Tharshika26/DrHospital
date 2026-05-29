import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axiosInstance from '../../utils/axioInstance';
import {
    Calendar,
    Plus,
    Clock,
    FolderOpen,
    RefreshCw,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Header from '../../components/Header';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [stats, setStats] = useState({
        totalAppointments: 0,
        todayAppointments: 0,
        totalPatients: 0,
        pendingRequests: []
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const statsRes = await axiosInstance.get('/doctors/dashboard-stats');
            setStats(statsRes.data);

            const doctorRes = await axiosInstance.get('/doctors/me');
            if (doctorRes.data && doctorRes.data.user) {
                setDoctorName(doctorRes.data.user.name);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="doctor" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title="Doctor Dashboard"
                    subtitle={`Welcome back, ${doctorName.split(' ')[0]}! Here's your overview for today.`}
                    userName={doctorName}
                    roleLabel="Doctor"
                />

                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <StatCard
                            icon={Calendar}
                            label="Today's Appointments"
                            value={stats.todayAppointments.toString()}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            loading={loading}
                        />
                        <StatCard
                            icon={Clock}
                            label="Total Appointments"
                            value={stats.totalAppointments.toString()}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            loading={loading}
                        />
                        <StatCard
                            icon={FolderOpen}
                            label="My Patients"
                            value={stats.totalPatients.toString()}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            loading={loading}
                        />
                    </div>

                    {/* Incoming Appointment Requests (Now showing Upcoming) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Incoming Appointment Requests</h2>
                            <button onClick={fetchDashboardData} className="p-2 text-slate-400 hover:text-slate-600 transition-colors" title="Refresh Feed">
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Patient Name</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium">Retrieving feed...</td></tr>
                                    ) : stats.pendingRequests.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-medium italic">No upcoming appointments scheduled.</td></tr>
                                    ) : (
                                        stats.pendingRequests.map(req => (
                                            <tr key={req.id} className="hover:bg-slate-50 transition-all group">
                                                <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-[#1c6b64] transition-colors">{req.patientName}</td>
                                                <td className="px-6 py-5 text-slate-600">{req.date}</td>
                                                <td className="px-6 py-5 text-slate-500 text-xs font-mono uppercase tracking-tighter">{req.time}</td>
                                                <td className="px-6 py-5">
                                                    {(() => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const apptDate = new Date(req.rawDate);
                                                        apptDate.setHours(0, 0, 0, 0);

                                                        const isPastDate = today > apptDate;
                                                        const isCompleted = req.status?.toLowerCase() === 'completed' || isPastDate;

                                                        return isCompleted ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#1c6b64]/5 text-[#15514b] border border-[#1c6b64]/10">
                                                                <CheckCircle size={10} /> Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                                                                <Clock size={10} /> Upcoming
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, subtext, iconColor, iconBg, loading }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col h-full hover:border-[#1c6b64]/30 transition-all shadow-sm group">
            <div className="flex items-start gap-4 mb-4">
                <div className={`p-4 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={26} />
                </div>
                <div>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
                    {loading ? <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg"></div> : <h3 className="text-3xl font-black text-slate-900">{value}</h3>}
                </div>
            </div>
            <div className="mt-2 pt-4 border-t border-slate-100">
                <p className="text-slate-400 text-xs italic">{subtext}</p>
            </div>
        </div>
    );
}

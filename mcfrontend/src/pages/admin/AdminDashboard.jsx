import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axioInstance';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import {
    Users,
    TrendingUp,
    TrendingDown,
    Bed,
    Stethoscope,
    CalendarCheck,
    Plus,
    RefreshCw
} from 'lucide-react';

import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('30days');
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        totalAppointments: 0,
        upcoming: []
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get('/admin/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard metrics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Dashboard" 
                    subtitle={`Welcome back, ${user?.name || 'Admin'}. Here's your hospital overview.`}
                    userName={user?.name || 'Administrator'}
                    roleLabel="ADMIN"
                />
                
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Users}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="TOTAL PATIENTS"
                            value={stats.totalPatients.toString()}


                        />
                        <StatCard
                            icon={Stethoscope}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="TOTAL DOCTORS"
                            value={stats.totalDoctors.toString()}

                        />
                        <StatCard
                            icon={CalendarCheck}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="TODAY'S APPTS"
                            value={stats.todayAppointments.toString()}

                        />
                        <StatCard
                            icon={Bed}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="TOTAL APPTS"
                            value={stats.totalAppointments.toString()}
                           
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Patient Growth Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-1">Patient Growth</h2>
                                    <p className="text-slate-400 text-xs">Patient registration trends (Last 30 days)</p>
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-4xl font-bold text-slate-900">{stats.totalPatients}</h3>
                                    <span className="text-slate-500 text-sm">total Active Patients</span>
                                </div>
                            </div>
                            {/* SVG Chart */}
                            <div className="h-64 relative">
                                <svg className="w-full h-full" viewBox="0 0 700 250" preserveAspectRatio="none">
                                    <path
                                        d="M 0,200 Q 50,120 100,140 T 200,100 T 300,80 T 400,50 T 500,120 T 600,90 T 700,110"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                    />
                                    <path
                                        d="M 0,200 Q 50,120 100,140 T 200,100 T 300,80 T 400,50 T 500,120 T 600,90 T 700,110 L 700,250 L 0,250 Z"
                                        fill="url(#areaGradient)"
                                        opacity="0.1"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#1c6b64" /><stop offset="100%" stopColor="#15514b" />
                                        </linearGradient>
                                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#1c6b64" /><stop offset="100%" stopColor="#1c6b64" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>

                        {/* Incoming Appointment Requests Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-1">Appointment Feed</h2>
                                    <p className="text-slate-400 text-xs">Recent activity across board</p>
                                </div>
                                <Link to="/admin/appointments" className="text-[#1c6b64] text-xs font-bold hover:text-[#34d399] uppercase">View All</Link>
                            </div>

                            <div className="overflow-hidden flex-1">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-slate-400 font-bold border-b border-slate-50 uppercase tracking-tighter">
                                        <tr>
                                            <th className="pb-3">Patient / Doctor</th>
                                            <th className="pb-3 text-right">Date / Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan="2" className="py-10 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /></td></tr>
                                        ) : !stats.upcoming || stats.upcoming.length === 0 ? (
                                            <tr><td colSpan="2" className="py-10 text-center text-slate-400">No recent activity.</td></tr>
                                        ) : (
                                            stats.upcoming.map(u => {
                                                return (
                                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-3 pr-2">
                                                            <p className="text-slate-800 font-bold truncate max-w-[120px]">{u.patientName}</p>
                                                            <p className="text-slate-500 text-[10px] truncate max-w-[120px]">Dr. {u.doctorName}</p>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <p className="text-slate-800 text-[10px] font-bold">{u.date}</p>
                                                            <p className="text-slate-400 text-[9px] mt-0.5">{u.time}</p>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, change, changePositive }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 transition-all hover:border-slate-300 shadow-sm">
            <div className={`p-3 rounded-xl ${iconBg} w-fit mb-4`}><Icon className={iconColor} size={24} /></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
        </div>
    );
}

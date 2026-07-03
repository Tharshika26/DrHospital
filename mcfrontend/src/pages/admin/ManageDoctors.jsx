import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    UserCog,
    Calendar,
    Briefcase,
    LogOut,
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    Star,
    Stethoscope,
    CalendarCheck,
    Mail,
    Phone,
    UserPlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AddDoctorPopup from '../../components/popups/AddDoctorPopup';
import axiosInstance from '../../utils/axioInstance';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

import toast from 'react-hot-toast';

export default function ManageDoctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const fetchDoctors = async () => {
        try {
            const { data } = await axiosInstance.get('/doctors');
            const mappedDoctors = data
                .filter(doc => doc.user)
                .map(doc => ({
                id: doc._id,
                name: doc.user?.name || 'Unknown',
                email: doc.user?.email || 'N/A',
                specialization: doc.specialization || 'General',
                phone: doc.phone || 'N/A',
                userId: doc.user?._id,
                isDisabled: doc.user?.isDisabled || false,
                avatarBg: 'bg-gradient-to-br from-[#1c6b64] to-[#15514b]',
                avatarText: doc.user?.name ? doc.user.name.substring(0, 2).toUpperCase() : 'DR',
                specializationColor: 'text-[#1c6b64] border-emerald-400/30 bg-emerald-400/10'
            }));
            setDoctors(mappedDoctors);
        } catch (err) {
            console.error('Failed to load doctors:', err);
            toast.error('Failed to load doctors');
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = specializationFilter === 'All' || doc.specialization === specializationFilter;

        // Handle "All Specializations" text from select potentially
        const cleanSpecFilter = specializationFilter === 'All Specializations' ? 'All' : specializationFilter;

        const matchesSpecClean = cleanSpecFilter === 'All' || doc.specialization === cleanSpecFilter;

        return matchesSearch && matchesSpecClean;
    });

    const handleDisable = async (userId, name, currentStatus) => {
        try {
            await axiosInstance.put(`/users/${userId}/toggle-disable`);
            toast.success(`Account for ${name} has been ${currentStatus ? 'enabled' : 'disabled'}.`);
            fetchDoctors();
        } catch (err) {
            toast.error("Failed to update user status");
        }
    };
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Manage Doctors" 
                    subtitle="View, search, and update doctor profiles and schedules."
                    userName={user?.name || 'Administrator'}
                    roleLabel="ADMIN"
                />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">

                    <div className="flex items-center justify-between mb-8">
                        <div>
                        </div>
                        <button
                            onClick={() => setShowAddPopup(true)}
                            className="flex items-center gap-2 bg-[#1c6b64] hover:bg-[#15514b] text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#1c6b64]/20 font-bold active:scale-95"
                        >
                            <UserPlus size={18} />
                            <span>Add New Doctor</span>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1c6b64] w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, ID or specialization..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="bg-white border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-[#1c6b64] focus:border-[#1c6b64] block px-4 py-3 outline-none transition-all shadow-sm min-w-[180px]"
                                value={specializationFilter}
                                onChange={(e) => setSpecializationFilter(e.target.value)}
                            >
                                <option>All Specializations</option>
                                <option>Cardiology</option>
                                <option>Neurology</option>
                                <option>Pediatrics</option>
                                <option>Orthopedics</option>
                                <option>Dermatology</option>
                            </select>
                            <button className="flex items-center gap-2 bg-[#1c6b64]/5 border border-[#1c6b64]/10 text-[#1c6b64] hover:bg-emerald-100 px-4 py-3 rounded-xl transition-all shadow-sm">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>



                    {/* Doctors Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Doctor Name</th>
                                        <th className="px-6 py-4 text-left">Specialization</th>
                                        <th className="px-6 py-4 text-left">Email Address</th>
                                        <th className="px-6 py-4 text-left">Contact Number</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredDoctors.map(doc => (
                                        <DoctorRow
                                            key={doc.id}
                                            {...doc}
                                            onDisable={() => handleDisable(doc.userId, doc.name, doc.isDisabled)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </div>

                </main>
                {showAddPopup && (
                    <AddDoctorPopup onClose={() => {
                        setShowAddPopup(false);
                        fetchDoctors();
                    }} />
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon className={iconColor} size={24} />
                </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
        </div>
    );
}

function DoctorRow({
    name,
    specialization,
    email,
    phone,
    avatarBg,
    avatarText,
    isDisabled,
    onDisable
}) {
    return (
        <tr className="hover:bg-slate-50 transition-colors group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-[#1c6b64]/10`}>
                        {avatarText}
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold text-sm">{name}</p>
                        {isDisabled && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-bold uppercase tracking-tighter">Disabled</span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#1c6b64]/10 bg-[#1c6b64]/5 text-[#1c6b64]">
                    {specialization}
                </span>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Mail size={14} className="text-slate-400" />
                    <span>{email}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Phone size={14} className="text-slate-400" />
                    <span>{phone}</span>
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                <button
                    disabled={isDisabled}
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to disable Dr. ${name}? This action cannot be undone.`)) {
                            onDisable();
                        }
                    }}
                    className={`p-2 px-4 border rounded-lg transition-all text-xs font-bold shadow-sm ${
                        isDisabled 
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 active:scale-95"
                    }`}
                >
                    {isDisabled ? "Account Disabled" : "Disable"}
                </button>
            </td>
        </tr>
    );
}

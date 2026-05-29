import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axioInstance';
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
    Stethoscope,
    UserPlus,
    Phone,
    Mail,
    RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

import toast from 'react-hot-toast';

export default function ManagePatients() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/patients');
            const formatted = res.data.map(p => ({
                _id: p._id,
                userId: p.user?._id,
                isDisabled: p.user?.isDisabled || false,
                id: p._id.substring(0, 8),
                name: p.user?.name || "Unknown",
                phone: p.contact || "N/A",
                email: p.user?.email || "N/A",
                lastVisit: "N/A",
                status: "Admitted", // Replace this dynamically later
                statusColor: "bg-[#1c6b64]/10 text-[#1c6b64]",
                doctor: "Not Assigned",
                avatarBg: "bg-gradient-to-br from-[#1c6b64] to-[#15514b]",
                avatarText: p.user?.name?.substring(0, 2).toUpperCase() || "??"
            }));
            setPatients(formatted);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDisable = async (userId, name, currentStatus) => {
        try {
            await axiosInstance.put(`/users/${userId}/toggle-disable`);
            toast.success(`Account for ${name} has been ${currentStatus ? 'enabled' : 'disabled'}.`);
            fetchPatients();
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
                    title="Manage Patients" 
                    subtitle="View, edit, and manage all registered patient profiles."
                    userName={user?.name || 'Administrator'}
                    roleLabel="ADMIN"
                />
                
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                        </div>
                        <div className="flex items-center gap-3">
                        </div>
                    </div>

                    {/* Patients Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Patient Name</th>
                                        <th className="px-6 py-4 text-left">Email Address</th>
                                        <th className="px-6 py-4 text-left">Contact Number</th>
                                        <th className="px-6 py-4 text-right">Account Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {patients.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No patients found.</td>
                                        </tr>
                                    ) : (
                                        patients.map(patient => (
                                            <PatientRow
                                                key={patient.id}
                                                {...patient}
                                                onDisable={() => handleDisable(patient.userId, patient.name, patient.isDisabled)}
                                            />
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


function PatientRow({
    name,
    phone,
    email,
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
                        if (window.confirm(`Are you sure you want to disable ${name}? This action cannot be undone.`)) {
                            onDisable();
                        }
                    }}
                    className={`p-2 px-4 border rounded-lg transition-all text-xs font-bold shadow-sm ${
                        isDisabled 
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 active:scale-95"
                    }`}
                >
                    {isDisabled ? "Account Disabled" : "Disable Account"}
                </button>
            </td>
        </tr>
    );
}


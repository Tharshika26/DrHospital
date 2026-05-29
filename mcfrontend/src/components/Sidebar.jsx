import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    LogOut,
    Plus,
    Users,
    CalendarClock,
    Stethoscope,
    Briefcase
} from 'lucide-react';
import authService from '../services/authService';
import logo from '../assets/logo.png';

const SidebarItem = ({ icon: Icon, label, active, role }) => {
    return (
        <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border ${active
            ? 'bg-[#1c6b64]/5 text-[#1c6b64] font-bold border-[#1c6b64]/10 shadow-sm'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
            }`}>
            <Icon size={20} />
            <span className="text-sm">{label}</span>
        </div>
    );
};

export default function Sidebar({ role }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const menuItems = {
        patient: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
            { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
            { icon: FileText, label: 'Medical Reports', path: '/patient/reports' },
            { icon: User, label: 'Profile', path: '/patient/profile' },
        ],
        doctor: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
            { icon: Users, label: 'Patients', path: '/doctor/patients' },
            { icon: CalendarClock, label: 'Appointments', path: '/doctor/appointments' },
            { icon: User, label: 'Profile', path: '/doctor/profile' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
            { icon: Stethoscope, label: 'Doctors', path: '/admin/doctors' },
            { icon: Users, label: 'Patients', path: '/admin/patients' },
            { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
            { icon: Briefcase, label: 'Services', path: '/admin/services' },
        ]
    };

    const renders = {
        patient: (
            <div className="pt-12 pb-4 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
        ),
        doctor: (
            <div className="pt-12 pb-4 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
        ),
        admin: (
            <div className="pt-12 pb-4 flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>
        )
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="mb-0">
                {renders[role]}
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1">
                {role !== 'patient' && (
                    <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4"></p>
                )}
                {menuItems[role].map((item) => (
                    <Link key={item.path} to={item.path}>
                        <SidebarItem
                            icon={item.icon}
                            label={item.label}
                            role={role}
                            active={location.pathname === item.path}
                        />
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-all w-full px-4 py-3 rounded-xl hover:bg-red-50 group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </aside>
    );
}

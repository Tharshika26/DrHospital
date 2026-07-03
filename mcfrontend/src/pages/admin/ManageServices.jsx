import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axioInstance';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    LogOut,
    Plus,
    Search,
    Edit,
    Trash2,
    Stethoscope,
    Heart,
    Brain,
    Bone,
    Baby,
    Sparkles,
    ScanLine
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AddServicePopup from '../../components/popups/AddServicePopup';
import EditServicePopup from '../../components/popups/EditServicePopup';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

const initialServices = [];

export default function ManageServices() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All Statuses');
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axiosInstance.get('/services');
                const formatted = res.data.map(s => ({
                    id: s._id,
                    title: s.name || s.title || "Untitled",
                    description: s.description,
                    iconName: s.iconName || "Heart",
                    
                    iconBg: "bg-slate-700/50",
                    iconColor: "text-white"
                }));
                setServices(formatted);
            } catch (err) {
                console.error(err);
            }
        };
        fetchServices();
    }, []);

    const filteredServices = services.filter(service => {
        const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All Statuses' || service.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleAdd = async (newService) => {
        try {
            const res = await axiosInstance.post('/services', {
                title: newService.title,
                name: newService.title,
                description: newService.description,
                status: newService.status,
                iconName: newService.iconName
            });
            const dbService = res.data;
            const service = {
                id: dbService._id,
                title: dbService.title || dbService.name,
                description: dbService.description,
                status: dbService.status,
                iconName: dbService.iconName,
                iconBg: "bg-slate-700/50",
                iconColor: "text-white"
            };
            setServices([...services, service]);
        } catch (err) {
            console.error('Error adding service', err);
        }
    };

    const handleDelete = (id, title) => {
        if (window.confirm(`System Confirmation: Are you sure you want to permanently delete the ${title} service? This action cannot be undone.`)) {
            setServices(services.filter(s => s.id !== id));
        }
    };

    const handleEditClick = (service) => {
        setSelectedService(service);
        setShowEditPopup(true);
    };

    const handleSaveEdit = (updatedService) => {
        setServices(services.map(s => s.id === updatedService.id ? {
            ...updatedService,
            statusColor: updatedService.status === 'Active' ? "bg-[#1c6b64]/10 text-[#1c6b64]" :
                updatedService.status === 'Maintenance' ? "bg-slate-500/10 text-slate-400" :
                    "bg-rose-500/10 text-rose-400"
        } : s));
        setShowEditPopup(false);
    };
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Hospital Services" 
                    subtitle="Manage the various medical specialties and facility services offered."
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
                            <Plus size={18} />
                            <span>Add New Service</span>
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map(service => {
                            const IconMap = {
                                Heart, Brain, Bone, Baby, Sparkles, ScanLine
                            };
                            const IconComponent = IconMap[service.iconName] || Heart;

                            return (
                                <ServiceCard
                                    key={service.id}
                                    icon={IconComponent}
                                    {...service}
                                    onEdit={() => handleEditClick(service)}
                                    onDelete={() => handleDelete(service.id, service.title)}
                                />
                            );
                        })}
                    </div>

                </main>
                {showAddPopup && (
                    <AddServicePopup onClose={() => setShowAddPopup(false)} onAdd={handleAdd} />
                )}
                {showEditPopup && selectedService && (
                    <EditServicePopup
                        service={selectedService}
                        onClose={() => setShowEditPopup(false)}
                        onSave={handleSaveEdit}
                    />
                )}
            </div>
        </div>
    );
}

function ServiceCard({ icon: Icon, title, description, status, onEdit, onDelete }) {
    const statusConfig = {
        Active: "bg-[#1c6b64]/5 text-[#1c6b64] border-[#1c6b64]/10",
        Maintenance: "bg-amber-50 text-amber-600 border-amber-100",
        Inactive: "bg-rose-50 text-rose-600 border-rose-100"
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#1c6b64]/30 transition-all group shadow-sm hover:shadow-md">
            <div className="mb-4">
                <div className="p-3 rounded-xl bg-slate-50 text-[#1c6b64] group-hover:bg-[#1c6b64]/5 transition-colors w-fit">
                    <Icon size={24} />
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">{description}</p>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                <button
                    onClick={onEdit}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs font-bold active:scale-95"
                >
                    <Edit size={16} />
                    <span>Edit Service</span>
                </button>
                <button
                    onClick={onDelete}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all border border-rose-100 active:scale-95"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

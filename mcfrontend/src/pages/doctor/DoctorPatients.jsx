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
    Search,
    Filter,
    RefreshCw,
    Mail,
    Phone,
    Eye,
    Edit3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PatientDetailsPopup from '../../components/popups/PatientDetailsPopup';
import ClinicalConditionPopup from '../../components/popups/ClinicalConditionPopup';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function DoctorPatients() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientToEditCondition, setPatientToEditCondition] = useState(null);
    const [showConditionPopup, setShowConditionPopup] = useState(false);
    const [doctorName, setDoctorName] = useState('Doctor');

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/patients/doctor-patients');
            const formatted = res.data
                .filter(p => p.user)
                .map(p => ({
                id: p._id.substring(0, 8),
                name: p.user?.name || "Unknown",
                email: p.user?.email || "N/A",
                contact: p.contact || "N/A",
                condition: p.clinicalCondition || "",
                lastVisit: "N/A",
                avatarText: p.user?.name?.substring(0, 2).toUpperCase() || "PT",
                ...p
            }));
            setPatients(formatted);
        } catch (err) {
            console.error("Error fetching doctor patients:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
        const fetchDoctor = async () => {
            try {
                const res = await axiosInstance.get('/doctors/me');
                if (res.data && res.data.user) setDoctorName(res.data.user.name);
            } catch (err) {}
        };
        fetchDoctor();
    }, []);

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });
    const handleSaveCondition = async (condition) => {
        if (!patientToEditCondition) return;
        try {
            await axiosInstance.put(`/patients/${patientToEditCondition._id}/condition`, { clinicalCondition: condition });
            toast.success("Clinical condition saved successfully!");
            setShowConditionPopup(false);
            fetchPatients();
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update clinical condition");
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="doctor" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Patient Management" 
                    subtitle="View and manage your assigned patient records in detail."
                    userName={doctorName}
                    roleLabel="Doctor"
                />

                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Patients Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Patient Name</th>
                                        <th className="px-6 py-4">Email Address</th>
                                        <th className="px-6 py-4">Contact Number</th>
                                        <th className="px-6 py-4">Clinical Condition</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                                No patients found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <PatientTableRow
                                                key={patient.id}
                                                {...patient}
                                                onView={() => setSelectedPatient(patient)}
                                                onAdd={() => {
                                                    setPatientToEditCondition(patient);
                                                    setShowConditionPopup(true);
                                                }}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <PatientDetailsPopup
                    patient={selectedPatient}
                    onClose={() => setSelectedPatient(null)}
                />

                {showConditionPopup && (
                    <ClinicalConditionPopup
                        initialCondition={patientToEditCondition?.clinicalCondition || ''}
                        patientName={patientToEditCondition?.user?.name}
                        onClose={() => setShowConditionPopup(false)}
                        onSave={handleSaveCondition}
                    />
                )}
            </div>
        </div>
    );
}

function PatientTableRow({
    name,
    avatarText,
    email,
    contact,
    condition,
    onView,
    onAdd
}) {
    const hasCondition = condition && 
                         condition.trim() !== "" && 
                         condition.toLowerCase() !== "n/a" && 
                         condition.toLowerCase() !== "none";

    return (
        <tr className="hover:bg-slate-50 transition-all group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1c6b64] to-[#15514b] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#1c6b64]/10">
                        {avatarText}
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold text-sm">{name}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 text-slate-600">
                <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <span>{email}</span>
                </div>
            </td>
            <td className="px-6 py-5 text-slate-600">
                <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{contact}</span>
                </div>
            </td>
            <td className="px-6 py-5">
                {hasCondition ? (
                    <div className="max-w-[200px]">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1c6b64]/5 text-[#1c6b64] border border-[#1c6b64]/10 wrap-anywhere line-clamp-2">
                            {condition}
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-1.5 bg-[#1c6b64]/5 hover:bg-[#1c6b64]/10 text-[#1c6b64] px-4 py-1.5 rounded-full text-xs font-bold border border-[#1c6b64]/10 transition-all active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        <span>Add</span>
                    </button>
                )}
            </td>
        </tr>
    );
}

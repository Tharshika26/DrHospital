import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
    User,
    Upload,
    FileText,
    Calendar,
    ClipboardList,
    Sparkles
} from 'lucide-react';
import axiosInstance from '../../utils/axioInstance';
import Header from '../../components/Header';

export default function PatientDashboard() {
    const navigate = useNavigate();
    const [patientInfo, setPatientInfo] = useState({ name: 'Loading...', id: '...' });
    const [dashboardData, setDashboardData] = useState({
        stats: { upcomingCount: 0, pastCount: 0, reportCount: 0 },
        upcomingAppointments: [],
        allReports: [] // Changed from latestReport to allReports
    });
    const [selectedReportIndex, setSelectedReportIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [profileRes, dashboardRes] = await Promise.all([
                    axiosInstance.get('/patients/me'),
                    axiosInstance.get('/patients/dashboard')
                ]);

                if (profileRes.data) {
                    setPatientInfo({
                        name: profileRes.data.user.name,
                        id: profileRes.data._id
                    });
                }

                if (dashboardRes.data) {
                    setDashboardData(dashboardRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
                setPatientInfo({ name: userInfo.name || 'Patient', id: '' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const { stats, upcomingAppointments, allReports } = dashboardData;
    const currentReport = allReports && allReports.length > 0 ? allReports[selectedReportIndex] : null;

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="patient" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Dashboard" 
                    subtitle={`Welcome back, ${patientInfo.name.split(' ')[0] || 'Patient'}. Here's your health overview.`}
                    userName={patientInfo.name}
                    roleLabel="Patient"
                />

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            icon={Calendar}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="Upcoming Appointments"
                            value={stats.upcomingCount.toString()}
                            subtext={stats.upcomingCount > 0 ? `${stats.upcomingCount} scheduled sessions` : "No upcoming appointments"}
                        />
                        <StatCard
                            icon={ClipboardList}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="Past Appointments"
                            value={stats.pastCount.toString()}
                            subtext="Total visits history"
                        />
                        <StatCard
                            icon={FileText}
                            iconColor="text-[#1c6b64]"
                            iconBg="bg-[#1c6b64]/5"
                            label="Medical Reports"
                            value={stats.reportCount.toString()}
                            subtext={`${stats.reportCount} reports uploaded`}
                            highlight
                        />
                    </div>

                    {/* Medical Report Analysis Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">Medical Report Analysis</h2>
                                    <p className="text-slate-500 text-sm">Review automated insights from your history of reports.</p>
                                </div>
                                
                                {allReports && allReports.length > 1 && (
                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 ml-4">
                                        <button 
                                            onClick={() => setSelectedReportIndex(prev => Math.max(0, prev - 1))}
                                            disabled={selectedReportIndex === 0}
                                            className="p-1 px-3 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all text-xs font-bold text-slate-600 shadow-sm border border-transparent hover:border-slate-100"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                            {selectedReportIndex + 1} / {allReports.length}
                                        </span>
                                        <button 
                                            onClick={() => setSelectedReportIndex(prev => Math.min(allReports.length - 1, prev + 1))}
                                            disabled={selectedReportIndex === allReports.length - 1}
                                            className="p-1 px-3 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all text-xs font-bold text-slate-600 shadow-sm border border-transparent hover:border-slate-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => navigate('/patient/reports')} className="flex items-center gap-2 bg-[#1c6b64] hover:bg-[#15514b] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-[#1c6b64]/20">
                                <Upload size={18} />
                                Upload New Report
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Extracted Values */}
                            <div className="lg:col-span-2">
                                {currentReport && currentReport.analysis ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                                currentReport.analysis.status?.toLowerCase() === 'normal' 
                                                ? 'bg-[#1c6b64]/10 text-[#1c6b64] border-[#1c6b64]/20 shadow-[#1c6b64]/5' 
                                                : 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                    currentReport.analysis.status?.toLowerCase() === 'normal' ? 'bg-[#1c6b64]' : 'bg-rose-500'
                                                }`}></span>
                                                {currentReport.analysis.status?.toLowerCase() === 'normal' ? 'Normal' : (currentReport.analysis.status?.toLowerCase() === 'abnormal' ? 'Abnormal' : currentReport.analysis.status)}
                                            </div>
                                            <div className="h-4 w-px bg-slate-200"></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-[#1c6b64] uppercase tracking-widest mb-0.5">{currentReport.originalname}</p>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                    Analyzed on {new Date(currentReport.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(currentReport.analysis.extractedValues || {}).slice(0, 4).map(([key, val]) => (
                                                <ValueCard
                                                    key={key}
                                                    label={key}
                                                    value={val}
                                                    status={currentReport.analysis.abnormalValues && currentReport.analysis.abnormalValues[key] ? 'Abnormal' : 'Normal'}
                                                />
                                            ))}

                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <FileText className="w-8 h-8 text-slate-300 mb-2" />
                                        <p className="text-slate-500 text-sm font-medium">No medical analysis results available history.</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Summary Card */}
                                <div className="bg-gradient-to-br from-[#1c6b64]/5 to-transparent rounded-3xl p-8 border border-[#1c6b64]/10 flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1c6b64]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#1c6b64]/10 transition-colors"></div>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="p-2.5 bg-[#1c6b64] rounded-xl text-white shadow-xl shadow-[#1c6b64]/20">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Insights</h3>
                                    </div>
                                    <div className="flex-1 relative z-10">
                                        <div className="relative">
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium italic mb-8 pl-2">
                                                {currentReport?.analysis?.summary || currentReport?.analysis?.simplifiedExplanation || "Upload your medical report and our advanced medical AI will provide automated insights, status detection, and personalized health recommendations."}
                                            </p>
                                        </div>
                                    </div>
                                    {currentReport && (
                                        <Link to="/patient/reports" className="flex items-center justify-center gap-2 w-full py-3.5 bg-white hover:bg-[#1c6b64] text-[#1c6b64] hover:text-white font-black rounded-xl transition-all border border-[#1c6b64]/10 text-[10px] uppercase tracking-widest active:scale-95 shadow-sm hover:shadow-lg hover:shadow-[#1c6b64]/10 relative z-10">
                                            View Full Analysis Detail
                                        </Link>
                                    )}
                                </div>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Appointments</h2>
                            <Link to="/patient/appointments" className="text-[#1c6b64] text-sm font-semibold hover:text-[#15514b] transition-colors">
                                View all appointments
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 pr-4">Doctor</th>
                                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 pr-4">Date</th>
                                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 pr-4">Time</th>
                                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {upcomingAppointments.length > 0 ? (
                                        upcomingAppointments.map((appt) => (
                                            <AppointmentRow
                                                key={appt._id}
                                                doctorName={`Dr. ${appt.doctor?.user?.name || 'Unknown'}`}
                                                specialty={appt.doctor?.specialization}
                                                date={new Date(appt.date).toLocaleDateString()}
                                                time={appt.timeSlot}
                                                status={appt.status}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 pr-4 text-center text-slate-500 text-sm">
                                                No upcoming appointments found.
                                            </td>
                                        </tr>
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

function SidebarItem({ icon: Icon, label, active }) {
    return (
        <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${active
            ? 'bg-[#1c6b64]/10 text-[#1c6b64] font-semibold'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}>
            <Icon size={20} />
            <span>{label}</span>
        </div>
    );
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, subtext, highlight }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon className={iconColor} size={24} />
                </div>
            </div>
            <p className="text-slate-500 text-sm mb-2">{label}</p>
            <h3 className="text-4xl font-bold text-slate-900 mb-1">{value}</h3>
            <p className={`text-xs ${highlight ? 'text-[#1c6b64]' : 'text-slate-400'}`}>{subtext}</p>
        </div>
    );
}

function ValueCard({ label, value, status }) {
    const isNormal = status === 'Normal';
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-[#1c6b64]/20 transition-all group">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-hover:text-[#1c6b64] transition-colors">{label}</p>
            <p className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{value}</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                isNormal 
                ? 'bg-[#1c6b64]/5 text-[#1c6b64] border-[#1c6b64]/10' 
                : 'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isNormal ? 'bg-[#1c6b64]' : 'bg-rose-500'}`}></span>
                {status}
            </div>
        </div>
    );
}

function RecommendationItem({ text }) {
    return (
        <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1c6b64] mt-1.5 shrink-0"></div>
            <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
        </div>
    );
}

function AppointmentRow({ doctorName, specialty, date, time, status, statusColor }) {
    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1c6b64]/10 flex items-center justify-center text-[#1c6b64] font-bold text-sm border border-[#1c6b64]/10">
                        {doctorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{doctorName}</p>
                        <p className="text-xs text-slate-500">{specialty}</p>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <p className="text-sm text-slate-600">{date}</p>
            </td>
            <td className="py-4 pr-4">
                <p className="text-sm text-slate-600">{time}</p>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#1c6b64]/10 text-[#1c6b64] border border-[#1c6b64]/20 shadow-sm shadow-[#1c6b64]/5 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1c6b64] animate-pulse"></span>
                    {status === 'Scheduled' || status === 'confirmed' ? 'Scheduled' : status}
                </div>
            </td>

        </tr>
    );
}

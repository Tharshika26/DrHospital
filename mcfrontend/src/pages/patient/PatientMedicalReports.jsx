import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Upload,
    CheckCircle,
    Clock,
    AlertCircle,
    FileSearch,
    Stethoscope,
    ChevronRight,
    Utensils,
    Info,
    Search,
    Scan,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import reportService from '../../services/reportService';
import { format } from 'date-fns';

export default function PatientMedicalReports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [activeReport, setActiveReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
    const patientName = userInfo.name || 'Patient';
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const data = await reportService.getMyReports();
            setReports(data || []);
            if (data && data.length > 0 && !activeReport) {
                setActiveReport(data[0]);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to load reports history");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            toast.success(`Selected: ${file.name}`);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setAnalyzing(true);
            toast("Analyzing your report...", { icon: '🔍' });
            
            const result = await reportService.uploadReport(formData);
            toast.success("Analysis complete!");
            
            await fetchReports();
            if (result.report && result.analysis) {
                setActiveReport({ ...result.report, analysis: result.analysis });
            } else if (result.report) {
                setActiveReport(result.report);
            }
            setSelectedFile(null);
        } catch (error) {
            toast.error("Analysis failed. Check your connection.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getStatusStyles = (status) => {
        const isNormal = status?.toLowerCase() === 'normal';
        return {
            container: isNormal ? 'bg-[#1c6b64]/50/10 border-[#1c6b64]/20' : 'bg-amber-500/10 border-amber-500/20',
            text: isNormal ? 'text-[#1c6b64]' : 'text-amber-400',
            dot: isNormal ? 'bg-[#1c6b64]/50' : 'bg-amber-500'
        };
    };

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="patient" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title="Report Analysis" 
                    subtitle="Simple health summaries for your medical reports."
                    userName={patientName}
                    roleLabel="Patient"
                />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        {/* Sidebar: Upload & List */}
                        <div className="xl:col-span-4 space-y-6">
                            
                            {/* Simple Upload */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-[#1c6b64]" />
                                    Scan New Report
                                </h2>
                                
                                <div
                                    onClick={handleUploadClick}
                                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer
                                        ${selectedFile ? 'border-[#1c6b64]/50 bg-[#1c6b64]/5' : 'border-slate-200 hover:border-[#1c6b64]/30'}`}
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} disabled={analyzing} />
                                    <FileSearch className={`w-8 h-8 mb-2 ${selectedFile ? 'text-[#1c6b64]' : 'text-slate-400'}`} />
                                    <p className="text-xs text-slate-500 text-center font-medium">
                                        {selectedFile ? selectedFile.name : 'Click to select report'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedFile || analyzing}
                                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all
                                        ${analyzing || !selectedFile 
                                            ? 'bg-slate-100 text-slate-400' 
                                            : 'bg-[#1c6b64] hover:bg-[#15514b] text-white shadow-lg shadow-[#1c6b64]/20'}`}
                                >
                                    {analyzing ? 'Processing...' : 'Analyze Now'}
                                </button>
                            </div>

                            {/* Supported Reports Info */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Supported for Analysis</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        'Blood Tests', 'Urine Analysis', 
                                        'X-Ray Results', 'MRI/CT Scans',
                                        'Prescriptions', 'Doctor Notes'
                                    ].map((type) => (
                                        <div key={type} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-1 h-1 rounded-full bg-[#1c6b64]"></div>
                                            <span className="text-[10px] font-medium text-slate-600">{type}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed italic">
                                    Our AI can analyze any clinical document or lab result to provide a simple summary.
                                </p>
                            </div>

                            {/* Reports List */}
                            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Reports</h3>
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {loading ? (
                                        <div className="p-8 text-center text-slate-400 text-sm italic">Loading...</div>
                                    ) : reports.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">No reports uploaded yet.</div>
                                    ) : (
                                        reports.map(report => (
                                            <div
                                                key={report._id}
                                                onClick={() => setActiveReport(report)}
                                                className={`p-4 cursor-pointer border-b border-slate-50 transition-all flex items-center gap-3
                                                    ${activeReport?._id === report._id ? 'bg-[#1c6b64]/5' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${activeReport?._id === report._id ? 'bg-[#1c6b64] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${activeReport?._id === report._id ? 'text-[#1c6b64]' : 'text-slate-700'}`}>
                                                        {report.originalname}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(report.uploadedAt), 'MMM dd, yyyy')}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Detail: Simplified Results */}
                        <div className="xl:col-span-8">
                            {!activeReport ? (
                                <div className="h-full bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                                    <Search size={48} className="text-slate-200 mb-4" />
                                    <h2 className="text-xl font-bold text-slate-300">Select a report to see findings</h2>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    
                                    {/* Decision Card */}
                                    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm overflow-hidden relative">
                                        
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 mb-1">{activeReport.originalname}</h2>
                                                <p className="text-slate-500 text-sm">Health Analysis</p>
                                            </div>
                                        </div>

                                        {/* Simple Explanation */}
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Stethoscope size={16} className="text-[#1c6b64]" />
                                                    <h3 className="text-xs font-bold text-[#1c6b64] uppercase tracking-widest">Simple Summary</h3>
                                                </div>
                                                {activeReport.analysis?.status && (
                                                    <div className="px-4 py-1.5 rounded-full border border-[#1c6b64]/20 bg-[#1c6b64]/10 text-[#1c6b64] text-[11px] font-bold uppercase tracking-widest shadow-sm">
                                                        {activeReport.analysis.status} Condition
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                                {activeReport.analysis?.simplifiedExplanation || "We are still processing your report details."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Suggestions & Diet */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-[#1c6b64]/5 rounded-lg text-[#1c6b64]">
                                                    <Utensils size={20} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900">Food & Diet Suggestions</h3>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {activeReport.analysis?.recommendations?.map((rec, i) => (
                                                    <div key={i} className="flex gap-4">
                                                        <div className="shrink-0 w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-[#1c6b64] border border-slate-100">
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-slate-600 text-sm leading-relaxed">
                                                            {rec}
                                                        </p>
                                                    </div>
                                                ))}
                                                {(!activeReport.analysis?.recommendations || activeReport.analysis?.recommendations.length === 0) && (
                                                    <p className="text-slate-400 text-sm italic">Standard balanced diet is generally recommended.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[#1c6b64]/5/50 border border-[#1c6b64]/10 rounded-3xl p-8 flex flex-col justify-center shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <AlertCircle size={24} className="text-[#1c6b64]" />
                                                <h3 className="text-lg font-bold text-emerald-800">Crucial Info</h3>
                                            </div>
                                            <p className="text-emerald-700 text-sm leading-relaxed mb-6">
                                                These suggestions are provided by AI based on your report text. They do not replace a professional doctor's advice.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                                                    window.open(`${backendUrl}${activeReport.fileUrl}`, '_blank');
                                                }}
                                                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs"
                                            >
                                                <ArrowUpRight size={14} />
                                                View Original Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

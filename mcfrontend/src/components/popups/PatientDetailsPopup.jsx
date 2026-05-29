import React from 'react';
import { X, Calendar, Phone, Activity, FileText, Clock, Mail, MapPin } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function PatientDetailsPopup({ patient, onClose }) {
    if (!patient) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-sm" />
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none mb-1">Patient File</h2>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Clinical history and records</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="flex items-start gap-6 mb-8">
                        <div className={`w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200`}>
                             <Activity className="text-[#1c6b64] w-10 h-10" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">{patient.name}</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">ID: {patient.id}</span>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${patient.statusColor || 'bg-[#1c6b64]/5 text-[#15514b] border-[#1c6b64]/10'}`}>
                                    {patient.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
                                <div className="flex items-center gap-1.5 hover:text-[#1c6b64] transition-colors cursor-pointer">
                                    <Phone size={14} />
                                    <span>{patient.contact}</span>
                                </div>
                                <div className="flex items-center gap-1.5 hover:text-[#1c6b64] transition-colors cursor-pointer">
                                    <Mail size={14} />
                                    <span>{patient.email || 'email@example.com'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-[#1c6b64]" />
                                Medical Condition
                            </h4>
                            <p className="text-slate-900 font-bold mb-1">{patient.condition}</p>
                            <p className="text-slate-500 text-xs font-medium">Diagnosed: Aug 2022</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calendar size={16} className="text-blue-500" />
                                Appointments
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Last Visit</span>
                                    <span className="text-slate-900 text-xs font-bold">{patient.lastVisit}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Next Visit</span>
                                    <span className="text-slate-900 text-xs font-bold">{patient.nextAppt}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-slate-900 font-black text-[10px] uppercase tracking-widest px-1">Case Notes</h4>
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#1c6b64]/30 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-black text-slate-800">Dr. Sarah Wilson</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{patient.lastVisit}</span>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                Patient reported feeling much better. Blood pressure within normal range. Advised to continue current medication and follow up in 3 months.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="px-5 py-2.5 bg-[#1c6b64] hover:bg-[#15514b] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#1c6b64]/20 transition-all active:scale-95">
                        Close Record
                    </button>
                </div>
            </div>
        </div>
    );
}

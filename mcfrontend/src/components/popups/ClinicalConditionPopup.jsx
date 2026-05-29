import React, { useState } from 'react';
import { X, Save, Stethoscope } from 'lucide-react';
import axiosInstance from '../../utils/axioInstance';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

export default function ClinicalConditionPopup({ initialCondition, patientName, onClose, onSave }) {
    const [condition, setCondition] = useState(initialCondition || '');

    const handleSave = () => {
        onSave(condition);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-sm" />
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-none mb-1">Clinical Condition</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                {patientName ? `Update status for ${patientName}` : 'Update condition details'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <label className="block text-slate-500 text-[10px] font-black mb-3 uppercase tracking-widest">
                        Condition Details
                    </label>
                    <textarea
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder="Enter clinical condition, symptoms, or status..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all resize-none h-32 placeholder:text-slate-400"
                        autoFocus
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all text-xs active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-[#1c6b64] hover:bg-[#15514b] text-white px-4 py-3 rounded-xl font-black transition-all shadow-lg shadow-[#1c6b64]/20 flex items-center justify-center gap-2 text-xs active:scale-95"
                    >
                        Save Details
                    </button>
                </div>
            </div>
        </div>
    );
}

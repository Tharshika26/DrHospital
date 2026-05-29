import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function AddSlotPopup({ onClose }) {
    const [formData, setFormData] = useState({
        startTime: '',
        endTime: '',
        status: 'available'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Slot details:', formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-sm" />
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none mb-1">Add Time Slot</h2>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Configure doctor availability</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Time</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Time</label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-[#1c6b64] text-white font-black hover:bg-[#15514b] transition-all shadow-lg shadow-[#1c6b64]/20 active:scale-95"
                        >
                            Add Slot
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React from 'react';
import { X, Clock, Save } from 'lucide-react';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

export default function EditWorkHoursPopup({ onClose }) {
    const handleSave = (e) => {
        e.preventDefault();
        toast.success('Work hours updated successfully (mock)!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-sm" />
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-none mb-1">Edit Work Schedule</h2>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Update clinical operating times</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Working Days</label>
                                <input type="text" defaultValue="Mon - Thu" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Working Hours</label>
                                <input type="text" defaultValue="09:00 - 17:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Weekend Days</label>
                                <input type="text" defaultValue="Friday" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Working Hours</label>
                                <input type="text" defaultValue="09:00 - 15:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-[#1c6b64] text-white font-black hover:bg-[#15514b] transition-all shadow-lg shadow-[#1c6b64]/20 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Save size={18} />
                            Save Schedule
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

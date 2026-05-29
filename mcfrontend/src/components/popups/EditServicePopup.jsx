import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function EditServicePopup({ service, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',

    });

    useEffect(() => {
        if (service) {
            setFormData({
                title: service.title,
                description: service.description,

            });
        }
    }, [service]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...service, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-10 w-auto drop-shadow-sm" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">Edit Service Details</h2>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Modify existing hospital service parameters</p>
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
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <textarea
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] h-24 resize-none transition-all"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
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
                            className="flex-1 px-4 py-3 rounded-xl bg-[#1c6b64] text-white font-bold hover:bg-[#15514b] transition-all shadow-lg shadow-[#1c6b64]/20 active:scale-95"
                        >
                            Update Service
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

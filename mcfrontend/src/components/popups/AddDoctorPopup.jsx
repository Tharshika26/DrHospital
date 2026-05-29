import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../utils/axioInstance';
import logo from '../../assets/logo.png';
import toast from 'react-hot-toast';

export default function AddDoctorPopup({ onClose }) {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', specialization: '', experienceYears: ''
    });
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await axiosInstance.get('/services');
                setServices(data);
            } catch (err) {
                console.error('Failed to fetch services:', err);
            }
        };
        fetchServices();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.firstName.trim() || !formData.lastName.trim()) return toast.error('Name is required');
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return toast.error('Please enter a valid email address');
        
        if (formData.phone.length < 10) return toast.error('Please enter a valid phone number');
        if (!formData.specialization) return toast.error('Please select a specialization');
        
        if (!formData.experienceYears) return toast.error('Years of experience is required');
        if (Number(formData.experienceYears) < 1) return toast.error('Experience must be at least 1 year');
        if (Number(formData.experienceYears) > 60) return toast.error('Please enter a realistic number of years of experience');

        try {
            await axiosInstance.post('/doctors', formData);
            toast.success('New doctor added successfully!');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add doctor');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-12 w-auto drop-shadow-sm" />
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">Add New Doctor</h2>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Register a new medical professional</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Specialization</label>
                                <div className="relative">
                                    <select name="specialization" value={formData.specialization} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] appearance-none transition-all" required>
                                        <option value="">Select Specialization</option>
                                        {services.map(s => (
                                            <option key={s._id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Experience (Years)</label>
                                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-all" required />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex gap-4">
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
                            Add Doctor Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

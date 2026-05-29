import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/axioInstance';
import toast from 'react-hot-toast';

export default function ContactSection() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });

    const { firstName, lastName, email, subject, message } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!firstName || !lastName || !email || !subject || !message) {
            return toast.error('Please fill in all fields');
        }

        setLoading(true);
        try {
            await axiosInstance.post('/contacts', {
                name: `${firstName} ${lastName}`,
                email,
                subject,
                message
            });
            toast.success('Message sent successfully!');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-white relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1c6b64]/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">Contact Us</h2>
                    <p className="text-slate-500">Have questions or need assistance? Reach out to our team.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#1c6b64]/5 rounded-xl text-[#1c6b64]">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Email Us</h3>
                                <p className="text-slate-500">Drhospital@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#1c6b64]/5 rounded-xl text-[#1c6b64]">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Call Us</h3>
                                <p className="text-slate-500">+94777698719</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#1c6b64]/5 rounded-xl text-[#1c6b64]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">Visit Us</h3>
                                <p className="text-slate-500">No.16, Main Street, Jaffna.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={firstName}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-colors" 
                                        placeholder="John" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={lastName}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-colors" 
                                        placeholder="Doe" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-colors" 
                                    placeholder="john@example.com" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={subject}
                                    onChange={onChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-colors" 
                                    placeholder="Appointment Inquiry" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Message</label>
                                <textarea 
                                    name="message"
                                    value={message}
                                    onChange={onChange}
                                    required
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] transition-colors h-32 resize-none" 
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        Sending...
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

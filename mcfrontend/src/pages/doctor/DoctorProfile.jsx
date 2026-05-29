import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Calendar,
    Users,
    CalendarClock,
    User,
    LogOut,
    ChevronDown,
    Eye,
    EyeOff,
    Mail
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axioInstance';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

export default function DoctorProfile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        experienceYears: '',
        bio: ''
    });

    const [originalEmail, setOriginalEmail] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const doctorName = `${formData.firstName} ${formData.lastName}`.trim() || 'Doctor';

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            try {
                const { data } = await axiosInstance.get('/doctors/me');
                const user = data.user || {};

                const names = user.name ? user.name.split(' ') : [''];
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                setFormData({
                    firstName: firstName,
                    lastName: lastName,
                    email: user.email || '',
                    phone: data.phone || '',
                    specialization: data.specialization || '',
                    experienceYears: data.experienceYears || '',
                    bio: data.bio || ''
                });
                setOriginalEmail(user.email || '');
            } catch (err) {
                console.error('Error fetching doctor', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctorProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Prevention logic
        if (['firstName', 'lastName', 'specialization'].includes(name)) {
            if (/\d/.test(value)) return; // Don't allow numbers
        }

        if (name === 'experienceYears') {
            if (value !== '' && parseInt(value) < 0) return; // Don't allow negative
        }

        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const { email, phone, firstName, lastName, specialization, experienceYears } = formData;

        if (!firstName || !lastName || !email || !phone || !specialization || !experienceYears) {
            toast.error("Please fill in all required fields.");
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }

        // Phone validation (exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            toast.error("Phone number must be 10 digits.");
            return false;
        }

        return true;
    };

    const submitProfileUpdate = async () => {
        try {
            toast.loading('Updating profile...', { id: 'update-profile' });
            const { data } = await axiosInstance.put('/doctors/me', formData);

            // Update local storage if name or email changed
            const localInfo = JSON.parse(sessionStorage.getItem('userInfo')) || {};
            localInfo.name = data.user?.name;
            localInfo.email = data.user?.email;
            sessionStorage.setItem('userInfo', JSON.stringify(localInfo));

            toast.success('Profile updated successfully!', { id: 'update-profile' });
            setIsEditing(false);
            setOriginalEmail(data.user?.email || formData.email);

            // Re-split name and update doctor profile details in form data
            const user = data.user || {};
            const names = user.name ? user.name.split(' ') : [''];
            setFormData({
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: user.email || '',
                phone: data.phone || '',
                specialization: data.specialization || '',
                experienceYears: data.experienceYears || '',
                bio: data.bio || ''
            });

        } catch (error) {
            console.error('Update failed', error);
            toast.error(error.response?.data?.message || 'Failed to update profile', { id: 'update-profile' });
        }
    };

    const handleSaveChanges = async () => {
        if (!validateForm()) return;

        // If email changed, trigger OTP flow
        if (formData.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase()) {
            try {
                toast.loading('Sending verification code to your new email...', { id: 'send-otp' });
                await axiosInstance.post('/auth/send-email-otp', {
                    email: formData.email,
                    name: doctorName
                });
                toast.success('Verification code sent!', { id: 'send-otp' });
                setOtpCode('');
                setOtpError('');
                setShowOtpModal(true);
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Failed to send verification email', { id: 'send-otp' });
            }
        } else {
            // Email not changed, update profile directly
            await submitProfileUpdate();
        }
    };

    const handleVerifyOtp = async () => {
        setOtpError('');
        if (!otpCode || otpCode.length < 6) {
            return setOtpError('Please enter the 6-digit code');
        }

        setVerifyingOtp(true);
        try {
            await axiosInstance.post('/auth/verify-email-otp', {
                email: formData.email,
                code: otpCode
            });
            setShowOtpModal(false);
            setOtpCode('');
            // Proceed with actual saving
            await submitProfileUpdate();
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };


    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            <Sidebar role="doctor" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title="Profile"
                    subtitle="Manage your professional and account settings."
                    userName={doctorName}
                    roleLabel="Doctor"
                />

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50 text-slate-700 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-8">Edit Professional Profile</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your specialization"
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">Work Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1c6b64]/50 focus:ring-1 focus:ring-[#1c6b64]/50 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>



                            {isEditing ? (
                                <div className="flex justify-start gap-4 pt-6">
                                    <button
                                        onClick={handleSaveChanges}
                                        className="bg-[#1c6b64] hover:bg-[#15514b] text-white px-8 py-2.5 rounded-lg font-medium shadow-lg shadow-[#1c6b64]/20"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-start pt-6">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-[#1c6b64] hover:bg-[#15514b] text-white px-8 py-2.5 rounded-lg font-medium shadow-lg shadow-[#1c6b64]/20"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* OTP Modal Overlay */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in zoom-in duration-200">
                        <button 
                            onClick={() => {
                                setShowOtpModal(false);
                                setOtpCode('');
                                setOtpError('');
                                setVerifyingOtp(false);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ✕
                        </button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#1c6b64]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-[#1c6b64]" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Verify Your Email</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                We've sent a 6-digit code to <strong>{formData.email}</strong>
                            </p>
                        </div>

                        {otpError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-xs text-center">
                                {otpError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5 text-center">Enter Verification Code</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only digits
                                    className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                    placeholder="------"
                                />
                            </div>
                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp}
                                className="w-full bg-[#1c6b64] hover:bg-[#155650] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifyingOtp ? 'Verifying...' : 'Verify & Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



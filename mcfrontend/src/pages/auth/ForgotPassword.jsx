import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../../utils/axioInstance';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email Request, 2: Success Screen
    const [email, setEmail] = useState('');
    const [showResetPopup, setShowResetPopup] = useState(false);
    const [popupStep, setPopupStep] = useState(1); // 1: Verify OTP, 2: Enter New Password
    
    // Reset Popup form states
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email address");
        }

        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            toast.success("Verification code sent to your email!");
            setOtpCode('');
            setPassword('');
            setConfirmPassword('');
            setPopupStep(1);
            setShowResetPopup(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "No account found with this email");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otpCode || otpCode.length < 6) {
            return toast.error("Please enter the 6-digit verification code");
        }

        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/verify-reset-otp', { email, code: otpCode });
            toast.success("Code verified! Now enter your new password.");
            setPopupStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid or expired verification code");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return toast.error('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', { 
                email, 
                code: otpCode, 
                password 
            });
            toast.success("Password reset successfully!");
            setShowResetPopup(false);
            setStep(2); // Go to Success Screen
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed. Please request a new OTP code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans">
            {/* Header/Navbar */}
            <div className="w-full pt-6 px-4 z-20">
                <Navbar variant="solid" />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 my-8 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#1c6b64]/5 blur-[120px] rounded-full pointer-events-none -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -mr-20 -mb-20"></div>

                <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-slate-200 relative z-10">
                    
                    {step === 1 && (
                        <div className="animate-in fade-in zoom-in duration-200">
                            <div className="mb-10 text-center">
                                <div className="w-20 h-20 bg-[#1c6b64]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1c6b64] border border-[#1c6b64]/10 animate-pulse">
                                    <Mail size={36} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Password Recovery</h2>
                                <p className="text-slate-500 text-sm font-medium">Enter your email and we'll send you an OTP code to reset your password.</p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1c6b64] transition-colors" />
                                        <input 
                                            type="email" 
                                            required
                                            placeholder="john@example.com" 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 pl-12 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] focus:bg-white transition-all font-semibold" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#1c6b64] hover:bg-[#15514b] text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#1c6b64]/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {isLoading ? "Sending..." : (
                                        <>
                                            Send Code (OTP)
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>

                                <Link to="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm">
                                    <ArrowLeft size={16} />
                                    Back to Login
                                </Link>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-200">
                            <div className="w-20 h-20 bg-[#1c6b64]/10 rounded-full flex items-center justify-center mx-auto text-[#1c6b64] border border-[#1c6b64]/10 animate-bounce">
                                <CheckCircle2 size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">Success!</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    Your password has been reset successfully. You can now use your new password to sign in.
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full bg-[#1c6b64] hover:bg-[#15514b] text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#1c6b64]/20 active:scale-[0.98] cursor-pointer"
                            >
                                Return to Login
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* OTP Verification & Password Reset Modal Popup */}
            {showResetPopup && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200 text-slate-900 font-sans">
                        <button 
                            onClick={() => {
                                setShowResetPopup(false);
                                setOtpCode('');
                                setPassword('');
                                setConfirmPassword('');
                                setPopupStep(1);
                                setShowPassword(false);
                                setShowConfirmPassword(false);
                            }}
                            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xl"
                            aria-label="Close popup"
                        >
                            ✕
                        </button>
                        
                        {popupStep === 1 ? (
                            <div className="animate-in fade-in duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-[#1c6b64]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1c6b64] border border-[#1c6b64]/10">
                                        <Mail size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Verify Email OTP</h3>
                                    <p className="text-xs text-slate-500 mt-2">
                                        We've sent a 6-digit code to <strong className="text-[#1c6b64]">{email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Verification Code</label>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            required
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all"
                                            placeholder="------"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#1c6b64] hover:bg-[#15514b] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
                                    >
                                        {isLoading ? 'Verifying Code...' : 'Verify Code'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-200">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-[#1c6b64]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1c6b64] border border-[#1c6b64]/10">
                                        <Lock size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Set New Password</h3>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Choose a strong password for your account <strong className="text-[#1c6b64]">{email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all font-semibold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-all font-semibold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#1c6b64] hover:bg-[#15514b] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 cursor-pointer"
                                    >
                                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}

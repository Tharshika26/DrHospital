import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, User, Mail, Lock, Check, Eye, EyeOff } from 'lucide-react';
import registerImg from '../../assets/register.png';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        gender: '',
        contact: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP Modal State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    const { firstName, lastName, email, password, confirmPassword, age, gender, contact, address } = formData;

    const onChange = (e) => {
        const { name, value } = e.target;
        
        if (['firstName', 'lastName'].includes(name)) {
            // Only allow letters and spaces
            if (!/^[A-Za-z\s]*$/.test(value)) return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleRegisterClick = async (e) => {
        e.preventDefault();
        setError('');

        // Basic presence validation
        if (!firstName.trim() || !lastName.trim()) return setError('Full name is required');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address');

        // Password validation: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        }
        if (password !== confirmPassword) return setError('Passwords do not match');

        // Age validation
        const ageNum = Number(age);
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) return setError('Please enter a valid age');

        // Gender validation
        if (!gender) return setError('Please select your gender');

        // Contact validation
        const contactRegex = /^\+?[0-9\s-]{10,}$/;
        if (!contactRegex.test(contact)) return setError('Please enter a valid contact number (at least 10 digits)');

        // Address validation
        if (!address.trim()) return setError('Please select your district');

        setLoading(true);
        try {
            // First, trigger OTP sending to the provided email
            const fullName = `${firstName} ${lastName}`.trim();
            await authService.sendEmailOtp(email, fullName);
            setShowOtpModal(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification email');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async () => {
        setOtpError('');
        if (!otpCode || otpCode.length < 6) {
            return setOtpError('Please enter the 6-digit code');
        }

        setVerifyingOtp(true);
        try {
            // Verify the email OTP
            await authService.verifyEmailOtp(email, otpCode);

            // If OTP is valid, proceed with actual registration
            const fullName = `${firstName} ${lastName}`.trim();
            const ageNum = Number(age);
            
            await authService.register({
                name: fullName,
                email,
                password,
                role: 'patient',
                age: ageNum,
                gender,
                contact,
                address
            });
            setShowOtpModal(false);
            navigate('/login');
        } catch (err) {
            setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 relative">
            
            {/* OTP Modal Overlay */}
            {showOtpModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
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
                                We've sent a 6-digit code to <strong>{email}</strong>
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
                                onClick={handleVerifyAndRegister}
                                disabled={verifyingOtp}
                                className="w-full bg-[#1c6b64] hover:bg-[#155650] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifyingOtp ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header/Navbar */}
            <div className="w-full pt-6 px-4 z-20">
                <Navbar variant="solid" />
            </div>

            {/* Main Content (Register Card) */}
            <main className="flex-1 flex items-center justify-center p-6 my-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-5xl w-full relative">
                    {/* Background Glows */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#1c6b64]/5 blur-[120px] rounded-full pointer-events-none -ml-20 -mt-20"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -mr-20 -mb-20"></div>

                    {/* Left Side - Register Form */}
                    <div className="md:w-1/2 p-8 md:p-12 bg-white z-10 flex flex-col justify-center">
                        <div className="max-w-md mx-auto w-full">

                            {/* Header Section */}
                            <div className="flex items-center gap-6 mb-8">
                                <Link to="/" className="shrink-0">
                                    <img src={logo} alt="Logo" className="h-20 w-auto" />
                                </Link>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 leading-tight">Create Your Patient Account</h2>
                                    <p className="text-slate-500 text-sm">Join us to manage your health with ease.</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegisterClick} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={firstName}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="Evelyn"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={lastName}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="Reed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={password}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-12 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="••••••••"
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
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-12 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="••••••••"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={age}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="25"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Gender</label>
                                        <select
                                            name="gender"
                                            value={gender}
                                            onChange={onChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contact"
                                        value={contact}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">District</label>
                                    <select
                                        name="address"
                                        value={address}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                    >
                                        <option value="" disabled>Select District</option>
                                        <option value="Ampara">Ampara</option>
                                        <option value="Anuradhapura">Anuradhapura</option>
                                        <option value="Badulla">Badulla</option>
                                        <option value="Batticaloa">Batticaloa</option>
                                        <option value="Colombo">Colombo</option>
                                        <option value="Galle">Galle</option>
                                        <option value="Gampaha">Gampaha</option>
                                        <option value="Hambantota">Hambantota</option>
                                        <option value="Jaffna">Jaffna</option>
                                        <option value="Kalutara">Kalutara</option>
                                        <option value="Kandy">Kandy</option>
                                        <option value="Kegalle">Kegalle</option>
                                        <option value="Kilinochchi">Kilinochchi</option>
                                        <option value="Kurunegala">Kurunegala</option>
                                        <option value="Mannar">Mannar</option>
                                        <option value="Matale">Matale</option>
                                        <option value="Matara">Matara</option>
                                        <option value="Monaragala">Monaragala</option>
                                        <option value="Mullaitivu">Mullaitivu</option>
                                        <option value="Nuwara Eliya">Nuwara Eliya</option>
                                        <option value="Polonnaruwa">Polonnaruwa</option>
                                        <option value="Puttalam">Puttalam</option>
                                        <option value="Ratnapura">Ratnapura</option>
                                        <option value="Trincomalee">Trincomalee</option>
                                        <option value="Vavuniya">Vavuniya</option>
                                    </select>
                                </div>



                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1c6b64] hover:bg-[#1c6b64] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1c6b64]/20 hover:shadow-[#1c6b64]/30 hover:scale-[1.01] transition-all duration-200 mt-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? 'Sending Code...' : 'Create Account'}
                                </button>

                                <div className="text-center mt-6">
                                    <p className="text-slate-500 text-sm">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-[#1c6b64] font-semibold hover:text-[#34d399] transition-colors">
                                            Log in
                                        </Link>
                                    </p>
                                </div>
                            </form>

                        </div>
                    </div>

                    {/* Right Side - Illustration */}
                    <div className="md:w-1/2 relative bg-slate-100/50 overflow-hidden">
                        <div className="absolute inset-0 z-0 bg-linear-to-br from-[#064e3b]/20 to-white/90"></div>

                        <img
                            src={registerImg}
                            alt="Registration Illustration"
                            className="absolute inset-0 w-full h-full object-cover opacity-100"
                        />
                        <div className="absolute inset-0 bg-[#1c6b64]/20 z-10"></div>
                        <div className="absolute inset-0 bg-linear-to-t from-[#1c6b64]/60  to-[#1c6b64]/60 via-transparent z-20"></div>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

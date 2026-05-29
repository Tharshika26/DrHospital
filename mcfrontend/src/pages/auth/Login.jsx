import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../assets/logo.png';
import loginImg from '../../assets/login.jpg';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please enter a valid email address');
        }

        // Password validation: min 8 chars, 1 upper, 1 lower, 1 digit, 1 special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
        }

        setLoading(true);
        try {
            const data = await authService.login(email, password);
            if (data.role === 'patient') {
                navigate('/patient/dashboard');
            } else if (data.role === 'doctor') {
                navigate('/doctor/dashboard');
            } else if (data.role === 'admin') {
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
            {/* Header/Navbar */}
            <div className="w-full pt-6 px-4 z-20">
                <Navbar variant="solid" />
            </div>

            {/* Main Content (Login Card) */}
            <main className="flex-1 flex items-center justify-center p-6 my-4">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-5xl w-full relative">
                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#1c6b64]/5 blur-[120px] rounded-full pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -ml-20 -mb-20"></div>

                    {/* Left Side - Image & Branding */}
                    <div className="md:w-1/2 relative bg-slate-100/50 p-8 md:p-12 flex flex-col justify-between overflow-hidden">
                        <div className="absolute inset-0 z-0">
                            <img
                                src={loginImg}
                                alt="Medical Professional"
                                className="w-full h-full object-cover opacity-60 hover:opacity-70 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-[#1c6b64]/40 via-[#1c6b64]/40 to-transparent"></div>
                        </div>

                        <div className="relative z-10">
                            <Link to="/" className="flex items-center mb-8">
                                <img src={logo} alt="Logo" className="h-24 w-auto" />
                            </Link>
                        </div>

                        <div className="relative z-10 mt-20 md:mt-0">
                            <h2 className="text-3xl font-bold text-slate-800 mb-4 leading-tight">
                                Secure & Efficient <br />
                                <span className="text-[#1c6b64]">
                                    Healthcare Management
                                </span>
                            </h2>
                            <p className=" text-slate-800 text-sm leading-relaxed max-w-md">
                                Connecting patients, doctors, and administrators seamlessly for better care and streamlined operations.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="md:w-1/2 p-8 md:p-12 bg-white z-10">
                        <div className="max-w-md mx-auto">
                            <div className="mb-10">
                                <h3 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h3>
                                <p className="text-slate-500 text-sm">Sign in to your account</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="you@example.com"
                                            value={email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-slate-600">Password</label>
                                        <Link to="/forgot-password" className="text-xs font-medium text-[#1c6b64] hover:text-[#34d399] transition-colors">Forgot password?</Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1c6b64] focus:ring-1 focus:ring-[#1c6b64] transition-colors"
                                            placeholder="••••••••"
                                            value={password}
                                            required
                                            onChange={(e) => setPassword(e.target.value)}
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1c6b64] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#1c6b64]/20 hover:shadow-[#1c6b64]/30 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="mt-8 text-center text-slate-500 text-sm">
                                Not a member?{' '}
                                <Link to="/register" className="text-[#1c6b64] font-semibold hover:text-[#34d399] transition-colors">
                                    Create an account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

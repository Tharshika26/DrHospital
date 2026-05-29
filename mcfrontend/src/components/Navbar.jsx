import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Menu, X } from 'lucide-react';

export default function Navbar({ variant = 'transparent' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (anchorId) => {
        setMobileMenuOpen(false);
        if (location.pathname === '/') {
            if (anchorId === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const element = document.getElementById(anchorId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            if (anchorId === 'home') {
                navigate('/');
            } else {
                navigate(`/#${anchorId}`);
            }
        }
    };

    const isTransparent = variant === 'transparent';

    // Navbar Container Styles
    const navContainerClass = isTransparent
        ? "bg-white/10 backdrop-blur-md border border-white/20 text-white"
        : "bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 shadow-md";

    // Navigation Link Styles
    const getLinkClass = (anchorId) => {
        const isActive = (anchorId === 'home' && location.pathname === '/' && !location.hash) || 
                         (location.hash === `#${anchorId}`);
        
        if (isTransparent) {
            return isActive
                ? "text-white font-bold text-lg pb-1 border-b-2 border-white capitalize tracking-wide transition-all cursor-pointer"
                : "text-white/80 hover:text-white font-bold text-lg transition-all capitalize tracking-wide cursor-pointer";
        } else {
            return isActive
                ? "text-[#1c6b64] font-bold text-lg pb-1 border-b-2 border-[#1c6b64] capitalize tracking-wide transition-all cursor-pointer"
                : "text-slate-600 hover:text-[#1c6b64] font-bold text-lg transition-all capitalize tracking-wide cursor-pointer";
        }
    };

    // Login Button Styles
    const loginBtnClass = isTransparent
        ? "text-white font-black text-2xl hover:text-[#21a598] transition-colors tracking-wide cursor-pointer"
        : "text-slate-800 font-black text-2xl hover:text-[#1c6b64] transition-colors tracking-wide cursor-pointer";

    // Register Button Styles
    const registerBtnClass = isTransparent
        ? "bg-white text-[#1c6b64] hover:bg-slate-50 px-6 py-2.5 rounded-xl font-black text-lg transition-all shadow-xl shadow-black/20 tracking-wide cursor-pointer"
        : "bg-[#1c6b64] text-white hover:bg-[#155650] px-6 py-2.5 rounded-xl font-black text-lg transition-all shadow-lg shadow-[#1c6b64]/20 tracking-wide cursor-pointer";

    return (
        <nav className={`${navContainerClass} flex items-center justify-between rounded-full px-8 py-4 max-w-5xl mx-auto relative z-30 transition-all duration-300`}>
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
                <img src={logo} alt="Logo" className="h-16 w-auto" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10">
                <button
                    onClick={() => handleNavClick('home')}
                    className={getLinkClass('home')}
                >
                    Home
                </button>
                <button
                    onClick={() => handleNavClick('services')}
                    className={getLinkClass('services')}
                >
                    Services
                </button>
                <button
                    onClick={() => handleNavClick('contact')}
                    className={getLinkClass('contact')}
                >
                    Contact Us
                </button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-6">
                <button
                    onClick={() => navigate('/login')}
                    className={loginBtnClass}
                >
                    Login
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className={registerBtnClass}
                >
                    Register
                </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
                <button
                    onClick={() => navigate('/login')}
                    className={`${isTransparent ? 'text-white' : 'text-slate-800'} font-bold text-lg`}
                >
                    Login
                </button>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1 focus:outline-none cursor-pointer"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className={`absolute top-full left-0 right-0 mt-3 p-6 rounded-3xl border flex flex-col gap-4 shadow-xl z-50 md:hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isTransparent 
                        ? 'bg-slate-900/95 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-800'
                }`}>
                    <button
                        onClick={() => handleNavClick('home')}
                        className={`text-left py-2 font-bold text-lg ${location.pathname === '/' && !location.hash ? 'text-[#1c6b64]' : ''}`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => handleNavClick('services')}
                        className={`text-left py-2 font-bold text-lg ${location.hash === '#services' ? 'text-[#1c6b64]' : ''}`}
                    >
                        Services
                    </button>
                    <button
                        onClick={() => handleNavClick('contact')}
                        className={`text-left py-2 font-bold text-lg ${location.hash === '#contact' ? 'text-[#1c6b64]' : ''}`}
                    >
                        Contact Us
                    </button>
                    <hr className={isTransparent ? 'border-slate-800' : 'border-slate-100'} />
                    <button
                        onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                        className="bg-[#1c6b64] text-white py-3 rounded-xl text-center font-bold shadow-md hover:bg-[#155650] transition-colors"
                    >
                        Register
                    </button>
                </div>
            )}
        </nav>
    );
}

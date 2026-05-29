import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

import { ChevronDown } from 'lucide-react';
import ContactSection from '../components/ContactSection';
import axiosInstance from '../utils/axioInstance';

export default function LandingPage() {
    const navigate = useNavigate();
    const [servicesData, setServicesData] = useState([]);
    const [activeService, setActiveService] = useState(0);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axiosInstance.get('/services');
                setServicesData(res.data || []);
            } catch (err) {
                console.error("Failed to fetch services:", err);
            }
        };
        fetchServices();
    }, []);

    // Smooth scroll to hash when navigating from another page
    useEffect(() => {
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                const timer = setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 200);
                return () => clearTimeout(timer);
            }
        }
    }, [servicesData]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1c6b64]/30">

            {/* Top Teal Section */}
            <div className="relative pt-6 pb-32 bg-linear-to-b from-[#10564F] to-[#125852] rounded-b-[40px] md:rounded-b-[80px] overflow-hidden">
                {/* Background Details */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
                    <img
                        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop"
                        alt="Hospital Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Navbar */}
                <div className="container mx-auto px-4 relative z-20">
                    <Navbar variant="transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 mt-20 text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 flex flex-col items-center">
                        <span>A Great Place care for</span>
                        <span className="relative mt-2 inline-block">
                            yourself
                            <svg className="absolute w-full h-4 -bottom-4 left-0 text-white opacity-80" viewBox="0 0 200 20" preserveAspectRatio="none">
                                <path d="M0,10 Q100,20 200,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-10 mt-8">
                        Medical recover is most focused in helping you discover your most beautiful smile
                    </p>

                    <Link to="/register" className="inline-block bg-[#1a7f75] hover:bg-[#156e65] text-white font-medium px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-[#0a423d]/30 text-sm">
                        Book Appointment
                    </Link>
                </div>
            </div>

            {/* Floating Booking Bar OVERLAPPING Teal & White background */}
            <div className="relative z-30 container mx-auto px-4 -mt-16 sm:-mt-12 mb-20 pointer-events-auto">
                <div className="max-w-5xl mx-auto bg-white rounded-4xl md:rounded-full shadow-2xl shadow-slate-200 p-6 md:p-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">

                    {/* Choose Services */}
                    <div className="flex flex-col w-full md:w-auto md:border-r border-slate-200 md:pr-8 text-center md:text-left">
                        <span className="text-xs text-slate-500 font-medium mb-1">Email Address</span>
                        <div className="flex items-center justify-center md:justify-start gap-2 cursor-pointer">
                            <span className="text-slate-800 font-semibold">drhospital2612@gmail.com</span>

                        </div>
                    </div>

                    {/* Choose Date */}
                    <div className="flex flex-col w-full md:w-auto md:border-r border-slate-200 md:pr-8 text-center md:text-left">
                        <span className="text-xs text-slate-500 font-medium mb-1">Address</span>
                        <div className="flex items-center justify-center md:justify-start gap-2 cursor-pointer">
                            <span className="text-slate-800 font-semibold">No.16, Main Street, Jaffna.</span>

                        </div>
                    </div>

                    {/* Contact Number */}
                    <div className="flex flex-col w-full md:w-auto text-center md:text-left">
                        <span className="text-xs text-slate-500 font-medium mb-1">Contact Number</span>
                        <span className="text-slate-800 font-semibold">+94777698719</span>
                    </div>

                    {/* Book Button */}
                    <div className="w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={() => navigate('/register')}
                            className="block text-center border-2 border-[#1c6b64] text-[#1c6b64] font-semibold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors whitespace-nowrap text-sm w-full"
                        >
                            Book Appointment
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <section id="services">
                    {/* NEW SERVICES SECTION (Matching uploaded image - LIGHT THEME) */}
                    <div className="relative py-20 md:py-28 bg-white overflow-hidden border-t border-slate-100">
                        {/* Background Image Overlay */}
                        <div className="absolute inset-0 z-0 opacity-15 bg-cover bg-center pointer-events-none"
                            style={{ backgroundImage: "url('/src/assets/service.avif')" }}>
                        </div>
                        {/* Green Tint Overlay */}
                        <div className="absolute inset-0 z-0 bg-[#0E5C54]/10 pointer-events-none"></div>

                        <div className="container mx-auto px-6 relative z-10">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24">

                                {/* Left Side: Header Text (CENTERED) */}
                                <div className="md:w-1/2 space-y-8 flex flex-col items-center text-center md:text-left md:items-start">
                                    <h2 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900">
                                        See what we provide to <br />
                                        <span className="text-[#1c6b64]">keep you healthy</span>
                                    </h2>
                                    <p className="text-slate-600 text-base md:text-left max-w-md leading-relaxed">
                                        With World-class Preventive, Prescriptive & Curative Medical Practices
                                        our hospital has been at the helm of Nurturing Healthy Living Since the
                                        Turn of the New Century.
                                    </p>
                                </div>

                                {/* Right Side: Vertical Scroll-style List */}
                                <div className="md:w-1/2 flex items-center justify-center w-full">
                                    <div className="relative flex items-center pr-12">
                                        <div className="space-y-8 text-right pr-12">
                                            {servicesData.length > 0 ? (
                                                servicesData.slice(0, 7).map((service, idx) => (
                                                    <div
                                                        key={idx}
                                                        onMouseEnter={() => setActiveService(idx)}
                                                        className={`text-xl md:text-2xl font-semibold transition-all duration-300 cursor-pointer ${activeService === idx ? 'text-[#1c6b64] scale-110 translate-x-[-10px]' : 'text-slate-300 hover:text-slate-400'}`}
                                                    >
                                                        {service.title || service.name}
                                                    </div>
                                                ))
                                            ) : (
                                                ['Cardiology', 'Anaesthesiology', 'Bariatric Surgery', 'Blood Bank', 'Endocrinology', 'Medical Oncology'].map((name, idx) => (
                                                    <div
                                                        key={idx}
                                                        onMouseEnter={() => setActiveService(idx)}
                                                        className={`text-xl md:text-2xl font-semibold transition-all duration-300 cursor-pointer ${activeService === idx ? 'text-[#1c6b64] scale-110 translate-x-[-10px]' : 'text-slate-300'}`}
                                                    >
                                                        {name}
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Vertical Progress Line */}
                                        <div className="absolute right-0 top-[-20px] bottom-[-20px] w-[2px] bg-slate-100">
                                            <div
                                                className="absolute w-2.5 h-12 bg-[#1c6b64] rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(28,107,100,0.3)]"
                                                style={{
                                                    top: `${(activeService / (servicesData.length > 0 ? Math.min(servicesData.length, 7) : 6)) * 85}%`,
                                                    right: '-4px'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <ContactSection />
                <Footer />
            </div>
        </div>
    );
}

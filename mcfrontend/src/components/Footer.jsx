import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import React from 'react';
import logo from '../assets/logo.png';

export default function Footer() {
    return (
        <footer className="bg-[#13655e] border-t border-[#1a7f76] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-full bg-black/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Main Footer Content */}
                <div className="grid md:grid-cols-12 gap-12 py-16">
                    {/* Brand Section - Takes 3 columns */}
                    <div className="md:col-span-5">
                        <div className="mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <img src={logo} alt="Logo" className="h-20 w-auto mb-2" />
                        </div>
                        <p className="text-white/70 text-base leading-relaxed mb-6 max-w-sm">
                            Empowering healthcare providers and patients with cutting-edge technology for better health outcomes. Delivering standardized medical excellence since 2004.
                        </p>
                    </div>

                    {/* Quick Links - Takes 3 columns */}
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-xl tracking-wide uppercase text-[12px] opacity-60">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white/80 hover:text-white transition-colors flex items-center group text-base">
                                    Home
                                </button>
                            </li>
                            <li>
                                <a href="#services" className="text-white/80 hover:text-white transition-colors flex items-center group text-base">
                                    Our Services
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="text-white/80 hover:text-white transition-colors flex items-center group text-base">
                                    Contact Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter - Takes 4 columns */}
                    <div className="md:col-span-4">
                        <h4 className="text-white font-bold mb-6 text-xl tracking-wide uppercase text-[12px] opacity-60">Get In Touch</h4>
                        <div className="space-y-6 mb-6">
                            <a href="mailto:Drhospital@gmail.com" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 group-hover:border-white flex items-center justify-center shrink-0 transition-colors">
                                    <Mail size={14} />
                                </div>
                                <span className="text-base font-medium">Drhospital@gmail.com</span>
                            </a>
                            <a href="tel:+15551234567" className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 group-hover:border-white flex items-center justify-center shrink-0 transition-colors">
                                    <Phone size={14} />
                                </div>
                                <span className="text-sm">+94777698719</span>
                            </a>
                            <div className="flex items-start gap-3 text-white/80">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                    <MapPin size={14} />
                                </div>
                                <span className="text-sm">No. 16,<br />Main Street, Jaffna.</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/50 text-sm flex items-center gap-2">
                            © 2024 Dr. HOSPITAL. Made with <Heart size={14} className="text-white/80 fill-white/80" /> for better healthcare.
                        </p>
                        <div className="flex items-center gap-6 text-xs text-white/50">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

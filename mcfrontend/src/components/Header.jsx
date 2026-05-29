import React from 'react';
import { User } from 'lucide-react';

const Header = ({ title, subtitle, userName, roleLabel }) => {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-[#1c6b64]/10 flex items-center justify-center text-[#1c6b64] border border-[#1c6b64]/10">
                        <User size={20} />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
                        <p className="text-[10px] text-[#1c6b64] font-bold uppercase tracking-wider mt-0.5">{roleLabel}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

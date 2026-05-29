import React from 'react';

export default function ServiceCard({ icon: Icon, title, description }) {
    const newLocal = "w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-700/50 group-hover:bg-[#1c6b64] transition-colors duration-300";
    return (
        <div className="card p-8 group hover:bg-slate-800/80">
            <div className={newLocal}>
                <Icon className="w-6 h-6 text-[#1c6b64] group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#1c6b64] transition-colors">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
}

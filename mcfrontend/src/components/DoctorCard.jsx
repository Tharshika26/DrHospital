import React from 'react';

export default function DoctorCard({ name, specialty, image, colorString = "bg-slate-700" }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 transition-all hover:-translate-y-1 hover:border-[#1c6b64]/30 shadow-xl shadow-black/20">
            <div className={`h-64 overflow-hidden ${colorString} relative`}>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-4xl font-bold opacity-30">
                        {name[4]}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="p-6 relative">
                <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
                <p className="text-[#1c6b64] text-sm font-medium uppercase tracking-wide">{specialty}</p>
            </div>
        </div>
    );
}

import React from 'react'

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`inline-flex items-center justify-center gap-2 rounded-full border border-blue-600/80 bg-linear-to-r from-blue-600 to-sky-500 px-5 py-2 text-sm font-medium text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-20px_rgba(37,99,235,0.95)] active:scale-95 ${className}`} {...props} >
        {children}
    </button>
);

export const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
    <button className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 ${className}`} {...props} >
        {children}
    </button>
);

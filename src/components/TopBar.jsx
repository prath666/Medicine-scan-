import React from 'react';
import { MapPin, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TopBar = () => {
    return (
        <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between animate-fade-in-down border-b border-slate-200/50 dark:border-slate-800/50">
            {/* Left: Greeting & Location */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    <MapPin size={12} className="text-teal-500" />
                    <span>Mumbai, India</span>
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-none">
                    Hello, <span className="text-teal-600 dark:text-teal-400">User</span> 👋
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm transition-transform active:scale-95">
                    <Bell size={20} />
                    <span className="absolute top-4 right-16 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                </button>
                {/* Note: ThemeToggle is positioned absolute in App.jsx currently, we might want to move it here later, 
                   but for now keeping the layout consistent with the plan. */}
            </div>
        </div>
    );
};

export default TopBar;

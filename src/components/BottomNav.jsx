import React from 'react';
import { Home, ScanLine, Settings } from 'lucide-react';

const BottomNav = ({ activeTab = 'home', onTabChange }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'scan', icon: ScanLine, label: 'Scan' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center animate-fade-in-up">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-full px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange && onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 
                                ${isActive
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95'
                                }
                            `}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;

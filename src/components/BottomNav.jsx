import React from 'react';
import { Home, ScanLine, Bookmark, User } from 'lucide-react';

const BottomNav = ({ activeTab = 'home', onTabChange }) => {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'scan', icon: ScanLine, label: 'Scan' },
        { id: 'saved', icon: Bookmark, label: 'Saved' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 animate-fade-in-up">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange && onTabChange(tab.id)}
                            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                        >
                            <div className={`
                        p-2 rounded-xl transition-all duration-300
                        ${isActive
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }
                    `}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
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

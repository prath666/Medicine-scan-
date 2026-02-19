import React, { useEffect, useState } from 'react';
import { ArrowLeft, Sun, Moon, Monitor, Github, Instagram, Heart, ExternalLink, Pill } from 'lucide-react';

const THEMES = [
    { id: 'light', icon: Sun, label: 'Light', desc: 'Always light' },
    { id: 'dark', icon: Moon, label: 'Dark', desc: 'Always dark' },
    { id: 'system', icon: Monitor, label: 'System', desc: 'Match device' },
];

const SettingsPage = ({ onBack }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const applyTheme = (selectedTheme) => {
        localStorage.setItem('theme', selectedTheme);

        if (selectedTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
        } else if (selectedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Listen for system theme changes when in system mode
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                document.documentElement.classList.toggle('dark', mediaQuery.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <div className="min-h-screen pb-24 px-5 pt-4 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
            </div>

            {/* Theme Section */}
            <div className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Appearance</h2>
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden">
                    {THEMES.map((t, index) => {
                        const Icon = t.icon;
                        const isActive = theme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 transition-all ${index < THEMES.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                                    } ${isActive ? 'bg-teal-50/80 dark:bg-teal-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                <div className={`p-2.5 rounded-xl transition-all ${isActive
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className={`text-sm font-semibold ${isActive ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {t.label}
                                    </span>
                                    <span className="text-xs text-slate-400">{t.desc}</span>
                                </div>
                                {isActive && (
                                    <div className="ml-auto w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">About</h2>
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl overflow-hidden">
                    {/* App Info */}
                    <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl text-white shadow-lg shadow-teal-500/25">
                                <Pill size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">MediScan</h3>
                                <p className="text-xs text-slate-400">v1.0.0 • Your Medicine Companion</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                            Your go-to app for quick medicine lookups. Scan any medicine box or search by name to get uses, side effects, dosage info, and available alternatives — all in one place.
                        </p>
                    </div>

                    {/* Social Links */}
                    <a
                        href="https://github.com/prath666"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="p-2.5 bg-slate-800 dark:bg-slate-700 rounded-xl text-white">
                            <Github size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">GitHub</span>
                            <span className="text-xs text-slate-400">@prath666</span>
                        </div>
                        <ExternalLink size={16} className="ml-auto text-slate-300 dark:text-slate-600" />
                    </a>

                    <a
                        href="https://instagram.com/flowdev_9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl text-white">
                            <Instagram size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Instagram</span>
                            <span className="text-xs text-slate-400">@flowdev_9</span>
                        </div>
                        <ExternalLink size={16} className="ml-auto text-slate-300 dark:text-slate-600" />
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 mt-10">
                <span>Made with</span>
                <Heart size={12} className="text-red-400 fill-red-400" />
                <span>by prath666</span>
            </div>
        </div>
    );
};

export default SettingsPage;

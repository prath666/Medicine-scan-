import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:scale-110 active:scale-95 group"
            aria-label="Toggle Dark Mode"
        >
            {theme === 'light' ? (
                <Moon size={16} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
            ) : (
                <Sun size={16} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            )}
        </button>
    );
};

export default ThemeToggle;

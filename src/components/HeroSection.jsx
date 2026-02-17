import React from 'react';

const HeroSection = ({ onSearch }) => {
    return (
        <div className="text-left px-6 py-8 max-w-6xl mx-auto animate-fade-in-down">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                What are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">looking for?</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-base font-medium">
                Search medicines, check salt compositions & more.
            </p>
        </div>
    );
};

export default HeroSection;

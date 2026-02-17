import React from 'react';
import { SearchX, RefreshCcw } from 'lucide-react';

const MedicineNotFound = ({ onRetry, searchedTerm }) => {
    return (
        <div className="max-w-2xl mx-auto p-8 text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-slate-100 rounded-full animate-ping opacity-75"></div>
                <SearchX size={48} className="text-slate-400 relative z-10" />
            </div>

            <h2 className="text-3xl font-bold text-slate-800 mb-3">Medicine Not Found</h2>
            <p className="text-slate-500 mb-8 text-lg">
                We couldn't find any information for <span className="font-semibold text-slate-700">"{searchedTerm}"</span>.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-left max-w-md mx-auto mb-8">
                <h3 className="font-semibold text-slate-700 mb-3">Suggestions:</h3>
                <ul className="space-y-2 text-slate-500 text-sm">
                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></span>
                        Check for spelling errors in the name
                    </li>
                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></span>
                        Try entering the generic name instead of the brand
                    </li>
                    <li className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></span>
                        If using an image, ensure the text is clear and well-lit
                    </li>
                </ul>
            </div>

            <button
                onClick={onRetry}
                className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-teal-500/30 active:scale-95"
            >
                <RefreshCcw size={18} />
                <span>Try Search Again</span>
            </button>
        </div>
    );
};

export default MedicineNotFound;

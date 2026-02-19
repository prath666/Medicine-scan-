import React, { useState, useRef, useEffect } from 'react';
import { Search, Camera, Loader2, Upload, ScanLine, Sparkles, X } from 'lucide-react';
import { processImageOCR } from '../utils/ocrProcessor';
import { fetchSuggestions, extractMedicineName } from '../services/groqService';

const MedicineSearch = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Debounced Suggestions
    useEffect(() => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        setIsSuggesting(true);
        debounceTimer.current = setTimeout(async () => {
            const results = await fetchSuggestions(query);
            if (results.length > 0) {
                setSuggestions(results);
                setShowSuggestions(true);
            }
            setIsSuggesting(false);
        }, 500); // 500ms debounce to save API calls

        return () => clearTimeout(debounceTimer.current);
    }, [query]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (query.trim() && !isLoading && !isProcessing) {
            onSearch(query);
        }
    };

    const handleSuggestionClick = (med) => {
        setQuery(med);
        setShowSuggestions(false);
        onSearch(med);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file) => {
        setIsProcessing(true);
        try {
            // 1. Get Raw Text from Tesseract
            const rawText = await processImageOCR(file);
            console.log("Raw OCR Text:", rawText);

            if (!rawText || rawText.length < 3) {
                alert("Could not read text. Try again.");
                return;
            }

            // 2. Clean it using Groq AI
            const cleanName = await extractMedicineName(rawText);
            console.log("AI Extracted Name:", cleanName);

            if (cleanName) {
                setQuery(cleanName);
                onSearch(cleanName);
            } else {
                // Fallback: Use the first 2-3 words of raw text if AI fails
                const fallback = rawText.split(' ').slice(0, 2).join(' ');
                setQuery(fallback);
                onSearch(fallback);
                alert("Could not identify exact medicine. Searching for: " + fallback);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to process image.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const isDisabled = isProcessing || isLoading;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 relative z-50">
            {/* Unified Search Container */}
            <div
                className={`
                    bg-white dark:bg-slate-900 
                    border border-slate-200 dark:border-slate-700 
                    rounded-[24px] shadow-sm 
                    transition-all duration-300 ease-out 
                    ${(isLoading || (showSuggestions && suggestions.length > 0)) ? 'shadow-xl ring-4 ring-teal-500/10 dark:ring-teal-400/5 rounded-b-[24px]' : 'hover:shadow-lg focus-within:shadow-xl focus-within:ring-4 focus-within:ring-teal-500/10'}
                `}
            >
                <form onSubmit={handleSubmit} className="relative z-20">
                    <div
                        className="flex items-center px-2 py-1"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {/* Search Icon / Loader */}
                        <div className="pl-4 text-slate-400 dark:text-slate-500">
                            {(isLoading || isSuggesting) ? (
                                <Loader2 size={22} className="animate-spin text-teal-500" />
                            ) : (
                                <Search size={22} strokeWidth={2.5} />
                            )}
                        </div>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query.length >= 3 && setSuggestions(prev => prev) && setShowSuggestions(true)}
                            placeholder="Search medicine (e.g. Dolo 650)..."
                            className="flex-1 py-4 px-4 text-lg font-medium text-slate-700 dark:text-slate-200 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal"
                            disabled={isDisabled}
                        />

                        {/* Clear Button (if text exists) */}
                        {query && !isDisabled && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}

                        {/* Action Buttons */}
                        <div className="pr-2 flex items-center space-x-1">
                            {/* Scan Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
                                disabled={isDisabled}
                                title="Scan medicine box"
                            >
                                <ScanLine size={22} strokeWidth={2} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            {/* Search Submit */}
                            {query.trim() && (
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    <Search size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Suggestions List */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 relative z-10 animate-slide-down">
                        <div className="px-5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50 flex justify-between">
                            <span>Suggestions</span>
                            <span className="text-teal-500 flex items-center gap-1"><Sparkles size={10} /> AI Powered</span>
                        </div>
                        <ul>
                            {suggestions.map((med, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(med)}
                                    className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-none flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Search size={14} />
                                        </div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                                            {med}
                                        </span>
                                    </div>
                                    <div className="-rotate-45 text-slate-300 group-hover:text-teal-500 transition-all group-hover:rotate-0">
                                        <Search size={16} strokeWidth={2.5} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="h-2 bg-transparent"></div> {/* Padding at bottom */}
                    </div>
                )}

                {/* Loading State — shimmer bar (Only when actually searching details, not just suggesting) */}
                {isLoading && (
                    <div className="border-t border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-5 space-y-3">
                            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 mb-2">
                                <Sparkles size={16} className="animate-pulse" />
                                <span className="text-sm font-semibold">Fetching details...</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 animate-pulse delay-100"></div>
                        </div>
                    </div>
                )}

                {/* Drag Overlay */}
                {dragActive && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[24px] flex items-center justify-center z-50 border-2 border-dashed border-teal-500">
                        <div className="text-teal-600 dark:text-teal-400 font-bold text-lg flex items-center gap-3">
                            <Upload size={28} />
                            Drop image to scan
                        </div>
                    </div>
                )}
            </div>

            {/* Tip */}
            {!showSuggestions && (
                <div className="text-center mt-4 text-slate-400 dark:text-slate-500 text-xs font-medium animate-fade-in-up">
                    Scan or type a medicine name to get instant details
                </div>
            )}
        </div>
    );
};

export default MedicineSearch;

import React, { useState, useRef } from 'react';
import { Camera, Upload, ChevronLeft, Loader2, RefreshCw, ScanLine, Search } from 'lucide-react';
import { processImageOCR } from '../utils/ocrProcessor';
import { extractMedicineName } from '../services/groqService';

const ScanPage = ({ onScanComplete, onBack }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [scannedImage, setScannedImage] = useState(null);
    const [extractedName, setExtractedName] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setScannedImage(imageUrl);
            processFile(file);
        }
    };

    const processFile = async (file) => {
        setIsProcessing(true);
        setExtractedName(null);

        try {
            // 1. Get Raw Text
            const text = await processImageOCR(file);

            if (!text || text.length < 3) {
                alert("Could not read text. Please try again with a clearer image.");
                setIsProcessing(false);
                setScannedImage(null);
                return;
            }

            // 2. Extract Medicine Name
            const cleanName = await extractMedicineName(text);

            if (cleanName) {
                setExtractedName(cleanName);
            } else {
                // Fallback
                const fallback = text.split(' ').slice(0, 2).join(' ');
                setExtractedName(fallback);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to process image.");
            setScannedImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetake = () => {
        setScannedImage(null);
        setExtractedName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col h-screen w-screen">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <h1 className="text-lg font-semibold tracking-wide">Scan Medicine</h1>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative bg-slate-900 w-full h-full">

                {scannedImage ? (
                    // Image Preview & Results Mode
                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <img
                            src={scannedImage}
                            alt="Scanned"
                            className="w-full h-full object-cover opacity-80"
                        />

                        {/* Overlay Results */}
                        {(!isProcessing && extractedName) && (
                            <div className="absolute bottom-32 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-slide-up text-center shadow-2xl">
                                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                                <span className="text-teal-400 text-xs font-bold uppercase tracking-wider mb-2 block">Detected Medicine</span>
                                <h2 className="text-2xl font-bold text-white mb-6 leading-tight">{extractedName}</h2>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRetake}
                                        className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center justify-center gap-2 transition-all border border-slate-700"
                                    >
                                        <RefreshCw size={18} />
                                        Retake
                                    </button>
                                    <button
                                        onClick={() => onScanComplete(extractedName)}
                                        className="flex-[2] py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all active:scale-95"
                                    >
                                        <Search size={20} strokeWidth={2.5} />
                                        Search Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-500/30 blur-xl rounded-full animate-pulse"></div>
                                    <Loader2 size={56} className="text-teal-400 animate-spin relative z-10" />
                                </div>
                                <p className="text-white text-xl font-medium mt-6 animate-pulse">Analyzing...</p>
                                <p className="text-slate-400 text-sm mt-2">Identifying medicine name</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Camera / Upload Mode
                    <div className="relative w-full h-full flex flex-col">
                        {/* Viewfinder Grid */}
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <div className="w-full h-full border-[1px] border-white/10 grid grid-cols-3 grid-rows-3">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border-[0.5px] border-white/5"></div>
                                ))}
                            </div>

                            {/* Corner Makers */}
                            <div className="absolute top-24 left-8 w-16 h-16 border-t-4 border-l-4 border-teal-500 rounded-tl-2xl"></div>
                            <div className="absolute top-24 right-8 w-16 h-16 border-t-4 border-r-4 border-teal-500 rounded-tr-2xl"></div>
                            <div className="absolute bottom-40 left-8 w-16 h-16 border-b-4 border-l-4 border-teal-500 rounded-bl-2xl"></div>
                            <div className="absolute bottom-40 right-8 w-16 h-16 border-b-4 border-r-4 border-teal-500 rounded-br-2xl"></div>
                        </div>

                        {/* Centered Instructions */}
                        <div className="flex-1 flex flex-col items-center justify-center z-20 relative px-10 text-center">
                            <ScanLine size={48} className="text-white/80 mb-6 animate-pulse" />
                            <h3 className="text-white text-lg font-medium mb-2">Point & Scan</h3>
                            <p className="text-slate-400 text-sm">
                                Align the medicine name within the frame. Ensure good lighting.
                            </p>
                        </div>

                        {/* Bottom Controls */}
                        <div className="bg-black/80 backdrop-blur-md pb-12 pt-8 px-8 rounded-t-3xl border-t border-white/10 absolute bottom-0 left-0 right-0 z-30">
                            <div className="flex items-center justify-between max-w-sm mx-auto">
                                {/* Upload Button */}
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors flex flex-col items-center justify-center w-14 h-14"
                                >
                                    <Upload size={22} />
                                </button>

                                {/* Shutter Button */}
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent relative hover:scale-105 transition-transform active:scale-95 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-white group-hover:bg-teal-50 transition-colors"></div>
                                </button>

                                {/* Placeholder for balance or Flash toggle */}
                                <div className="w-14 h-14"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden Input - Supports Environment (Rear) Camera */}
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default ScanPage;

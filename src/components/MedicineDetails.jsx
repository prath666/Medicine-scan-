import React, { useEffect, useState } from 'react';
import { Pill, AlertTriangle, ShieldCheck, Sparkles, ArrowLeft, Thermometer, Activity, Building2, Tablet, FileText, Globe, Loader2, ChevronDown, Zap } from 'lucide-react';
import { translateMedicineDetails } from '../services/geminiService';

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Hindi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'Telugu', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'Bengali', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
  { code: 'Gujarati', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'Malayalam', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'Urdu', label: 'اردو', flag: '🇵🇰' },
];

const MedicineDetails = ({ data, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [displayData, setDisplayData] = useState(data);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [translationCache, setTranslationCache] = useState({});

  const {
    name = 'Unknown',
    category = '',
    manufacturer = '',
    description = '',
    dosage = '',
    uses = [],
    sideEffects = [],
    warnings = [],
    alternatives = {},
    substitutes = []
  } = displayData || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset when original data changes
  useEffect(() => {
    setDisplayData(data);
    setSelectedLanguage('English');
    setTranslationCache({});
  }, [data]);

  const handleLanguageChange = async (langCode) => {
    setShowLangDropdown(false);
    if (langCode === selectedLanguage) return;

    setSelectedLanguage(langCode);

    if (langCode === 'English') {
      setDisplayData(data);
      return;
    }

    // Check cache first
    if (translationCache[langCode]) {
      setDisplayData(translationCache[langCode]);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateMedicineDetails(data, langCode);
      if (translated) {
        setDisplayData(translated);
        setTranslationCache(prev => ({ ...prev, [langCode]: translated }));
      } else {
        alert("Translation failed. Showing original.");
        setSelectedLanguage('English');
        setDisplayData(data);
      }
    } catch (err) {
      console.error(err);
      alert("Translation error.");
      setSelectedLanguage('English');
      setDisplayData(data);
    } finally {
      setIsTranslating(false);
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in-up font-sans relative">
      {/* Translation Loading Overlay */}
      {isTranslating && (
        <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full animate-pulse"></div>
            <Globe size={48} className="text-teal-500 animate-spin relative z-10" />
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-white animate-pulse">Translating to {currentLang.label}...</p>
          <p className="text-sm text-slate-400 mt-1">Powered by Gemini Flash</p>
        </div>
      )}

      {/* Top Bar: Back + Language Selector */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <Globe size={16} className="text-teal-500" />
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showLangDropdown && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)}></div>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Translate to</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm ${selectedLanguage === lang.code
                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {selectedLanguage === lang.code && (
                        <span className="ml-auto text-teal-500 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modern Header */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {category && (
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold tracking-wide uppercase">
              {category}
            </span>
          )}
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
            <ShieldCheck size={12} strokeWidth={3} /> Verified
          </span>
          {displayData?._cached && (
            <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
              <Zap size={12} strokeWidth={3} /> Cached
            </span>
          )}
          {selectedLanguage !== 'English' && (
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
              <Globe size={12} /> {currentLang.label}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          {name}
        </h1>

        {description && (
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mb-6">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
          {manufacturer && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-400">
                <Building2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{manufacturer}</span>
              </div>
            </div>
          )}
          {dosage && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-slate-400">
                <Tablet size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{dosage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Primary Uses - Clean List */}
        {uses.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-500" />
              Uses
            </h3>
            <ul className="space-y-4">
              {uses.map((use, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Side Effects - Clean List */}
        {sideEffects.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
              Side Effects
            </h3>
            <ul className="space-y-4">
              {sideEffects.slice(0, 5).map((effect, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{effect}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Warnings - Full Width, Minimal Warning Box */}
      {warnings.length > 0 && (
        <div className="mb-12 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Safety Warnings</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-rose-100/50 dark:border-white/5">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternatives & Substitutes */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-10 mt-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Alternatives & Substitutes</h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generic */}
          {alternatives?.generic && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Generic Composition</span>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                {alternatives.generic}
              </p>
            </div>
          )}

          {/* Brands */}
          {(alternatives?.similar?.length > 0 || substitutes?.length > 0) && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Other Brands</span>
              <div className="flex flex-wrap gap-2">
                {[...(alternatives?.similar || []), ...(substitutes || [])].map((item, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default MedicineDetails;

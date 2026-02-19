import { useState } from 'react';
import HeroSection from './components/HeroSection';
import LiveBackground from './components/LiveBackground';
import MedicineSearch from './components/MedicineSearch';
import MedicineDetails from './components/MedicineDetails';
import MedicineNotFound from './components/MedicineNotFound';
import ThemeToggle from './components/ThemeToggle';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import { fetchMedicineDetails } from './services/groqService';
import ScanPage from './components/ScanPage';
import './App.css';

function App() {
  const [searchStatus, setSearchStatus] = useState('IDLE');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchedTerm, setSearchedTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleSearch = async (query) => {
    setSearchedTerm(query);
    setIsLoading(true);
    setSearchStatus('LOADING');
    // Ensure we switch to home if searching from another tab
    setActiveTab('home');

    try {
      const result = await fetchMedicineDetails(query);

      if (result) {
        setSelectedMedicine(result);
        setSearchStatus('FOUND');
      } else {
        setSelectedMedicine(null);
        setSearchStatus('NOT_FOUND');
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchStatus('NOT_FOUND');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchStatus('IDLE');
    setSelectedMedicine(null);
    setSearchedTerm('');
    setIsLoading(false);
  };

  // Dedicated Scan Handler
  const handleScanComplete = (medicineName) => {
    setActiveTab('home');
    handleSearch(medicineName);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 -z-30 transition-colors duration-500"></div>

      <LiveBackground />

      <ThemeToggle />

      {/* Render Scan Page Full Screen if Active */}
      {activeTab === 'scan' ? (
        <ScanPage
          onScanComplete={handleScanComplete}
          onBack={() => setActiveTab('home')}
        />
      ) : (
        /* Home / Search View */
        <>
          {(searchStatus === 'IDLE' || searchStatus === 'LOADING') && (
            <div className="pb-24 md:pb-0 md:pt-10">
              <div className="flex flex-col min-h-[80vh] w-full max-w-md mx-auto md:max-w-4xl">
                <HeroSection />

                <div className="-mt-2 mb-6">
                  <MedicineSearch onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {!isLoading && (
                  <>
                    {/* Clean Home Screen - No other elements per user request */}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Results View (Only show if NOT scanning) */}
      {activeTab !== 'scan' && searchStatus === 'FOUND' && selectedMedicine && (
        <MedicineDetails
          data={selectedMedicine}
          onBack={resetSearch}
        />
      )}

      {activeTab !== 'scan' && searchStatus === 'NOT_FOUND' && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <MedicineNotFound
            searchedTerm={searchedTerm}
            onRetry={resetSearch}
          />
        </div>
      )}

      {/* Mobile Bottom Nav - Always visible */}
      {activeTab !== 'scan' && (
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
    </div>
  );
}

export default App;

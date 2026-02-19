import { useState } from 'react';
import HeroSection from './components/HeroSection';
import LiveBackground from './components/LiveBackground';
import MedicineSearch from './components/MedicineSearch';
import MedicineDetails from './components/MedicineDetails';
import MedicineNotFound from './components/MedicineNotFound';
import BottomNav from './components/BottomNav';
import SettingsPage from './components/SettingsPage';
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

  const handleScanComplete = (medicineName) => {
    setActiveTab('home');
    handleSearch(medicineName);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/30 -z-30 transition-colors duration-500"></div>

      <LiveBackground />

      {/* Render based on active tab */}
      {activeTab === 'scan' ? (
        <ScanPage
          onScanComplete={handleScanComplete}
          onBack={() => setActiveTab('home')}
        />
      ) : activeTab === 'settings' ? (
        <SettingsPage onBack={() => setActiveTab('home')} />
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
                    {/* Clean Home Screen */}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Results View */}
      {activeTab !== 'scan' && activeTab !== 'settings' && searchStatus === 'FOUND' && selectedMedicine && (
        <MedicineDetails
          data={selectedMedicine}
          onBack={resetSearch}
        />
      )}

      {activeTab !== 'scan' && activeTab !== 'settings' && searchStatus === 'NOT_FOUND' && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <MedicineNotFound
            searchedTerm={searchedTerm}
            onRetry={resetSearch}
          />
        </div>
      )}

      {/* Bottom Nav - Show on home, settings, not_found. Hide on scan and details */}
      {activeTab !== 'scan' && !(searchStatus === 'FOUND' && selectedMedicine) && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;

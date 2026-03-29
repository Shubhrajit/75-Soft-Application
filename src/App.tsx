import { useState } from 'react';
import { StoreProvider, useStore } from './StoreContext';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import PostMortemModal from './components/PostMortemModal';
import { Home as HomeIcon, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';

function MainApp() {
  const { state, startChallenge, currentDayNumber } = useStore();
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'settings'>('home');

  if (!state.startDate) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex flex-col items-center justify-center p-6 text-[#475569]">
        <div className="max-w-md w-full bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4 text-[#B2C8BA]">75-Soft Challenge</h1>
          <p className="text-lg mb-8 opacity-80">Build discipline, one day at a time.</p>
          <button
            onClick={startChallenge}
            className="w-full py-4 bg-[#B2C8BA] hover:bg-[#A1B8A9] text-white rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#475569] pb-24 font-sans selection:bg-[#D6CDEA] selection:text-[#475569]">
      <PostMortemModal />
      
      <main className="max-w-md mx-auto p-6">
        {activeTab === 'home' && <Home />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/40 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeTab === 'home' ? 'text-[#B2C8BA]' : 'text-[#475569]/50 hover:text-[#475569]/70'
            }`}
          >
            <HomeIcon size={24} />
            <span className="text-xs font-medium">Today</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeTab === 'dashboard' ? 'text-[#B2C8BA]' : 'text-[#475569]/50 hover:text-[#475569]/70'
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'text-[#B2C8BA]' : 'text-[#475569]/50 hover:text-[#475569]/70'
            }`}
          >
            <SettingsIcon size={24} />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

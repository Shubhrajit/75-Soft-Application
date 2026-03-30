import { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import PostMortemModal from './components/PostMortemModal';
import StartJourneyModal from './components/StartJourneyModal';
import { Home as HomeIcon, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

function MainApp() {
  const { state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showStartModal, setShowStartModal] = useState(false);

  if (!state.startDate && location.pathname !== '/settings') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans relative">
        <button 
          onClick={() => navigate('/settings')}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <SettingsIcon size={24} />
        </button>
        <div className="max-w-md w-full text-center space-y-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-serif font-bold text-primary mb-4">75 Soft</h1>
            <p className="text-muted-foreground text-lg mb-8">A sustainable approach to building better habits.</p>
            <button
              onClick={() => setShowStartModal(true)}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Start Journey
            </button>
          </motion.div>
        </div>
        
        {showStartModal && (
          <StartJourneyModal isOpen={showStartModal} onClose={() => setShowStartModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-accent selection:text-foreground">
      <PostMortemModal />
      
      <main className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          {/* @ts-expect-error - key is valid in React but RoutesProps doesn't explicitly type it */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full bg-muted border-t border-border/30 pb-safe z-40">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
          {[
            { path: '/', icon: HomeIcon, label: 'Home' },
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/settings', icon: SettingsIcon, label: 'Settings' },
          ].map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center w-20 h-full gap-1"
              >
                <div
                  className={cn(
                    "w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                    isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted-hover"
                  )}
                >
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </StoreProvider>
  );
}

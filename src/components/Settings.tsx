import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Download, Trash2, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { state, updateProfile, resetChallenge } = useStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showResetModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showResetModal, countdown]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile(e.target.value, state.remindersEnabled);
  };

  const handleRemindersToggle = () => {
    updateProfile(state.profileName, !state.remindersEnabled);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', url);
      downloadAnchorNode.setAttribute('download', '75soft-data.json');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
    }
  };

  const handleResetClick = () => {
    setShowResetModal(true);
    setCountdown(3);
  };

  const confirmReset = () => {
    resetChallenge();
    setShowResetModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <header className="mb-8 text-center pt-4">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground font-medium text-sm">Customize Your Experience</p>
      </header>

      <div className="space-y-4">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center">
              <User size={24} />
            </div>
            <h2 className="text-lg font-medium text-foreground">Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground/80 font-medium">Name</label>
            <input
              type="text"
              value={state.profileName}
              onChange={handleNameChange}
              className="w-full bg-muted border border-border/30 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
              <Bell size={24} />
            </div>
            <h2 className="text-lg font-medium text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Daily Reminders</span>
            <button
              onClick={handleRemindersToggle}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                state.remindersEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  state.remindersEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">
            (Mockup) Receive a gentle nudge to complete your daily tasks.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-colors border border-border/30"
          >
            <Download size={20} />
            Export Data
          </button>
          <button
            onClick={handleResetClick}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-full font-medium transition-colors border border-red-100"
          >
            <Trash2 size={20} />
            Reset Challenge
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Reset Challenge?</h2>
              <p className="text-muted-foreground text-sm mb-6">
                This will permanently delete all your progress, history, and data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  disabled={countdown > 0}
                  className={`flex-1 py-3 px-4 rounded-full font-medium transition-all shadow-md ${
                    countdown > 0 
                      ? 'bg-red-300 text-white cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {countdown > 0 ? `Wait (${countdown}s)` : 'Reset Data'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

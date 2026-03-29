import React from 'react';
import { useStore } from '../StoreContext';
import { motion } from 'motion/react';
import { User, Bell, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  const { state, updateProfile, resetChallenge } = useStore();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile(e.target.value, state.remindersEnabled);
  };

  const handleRemindersToggle = () => {
    updateProfile(state.profileName, !state.remindersEnabled);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "75soft-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the challenge? This cannot be undone.")) {
      resetChallenge();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <header className="mb-8 text-center pt-4">
        <h1 className="text-3xl font-serif font-bold text-[#475569] mb-2">Settings</h1>
        <p className="text-[#475569]/60 font-medium text-sm">Customize Your Experience</p>
      </header>

      <div className="space-y-4">
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#B2C8BA]/20 text-[#B2C8BA] flex items-center justify-center">
              <User size={24} />
            </div>
            <h2 className="text-lg font-medium text-[#475569]">Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#475569]/60 font-medium">Name</label>
            <input
              type="text"
              value={state.profileName}
              onChange={handleNameChange}
              className="w-full bg-[#F9F6F0] border border-white/40 rounded-xl px-4 py-3 text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#B2C8BA]/50 transition-all"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D6CDEA]/30 text-[#D6CDEA] flex items-center justify-center">
              <Bell size={24} />
            </div>
            <h2 className="text-lg font-medium text-[#475569]">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#475569]/80 font-medium">Daily Reminders</span>
            <button
              onClick={handleRemindersToggle}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                state.remindersEnabled ? 'bg-[#B2C8BA]' : 'bg-[#475569]/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  state.remindersEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-[#475569]/50 mt-2">
            (Mockup) Receive a gentle nudge to complete your daily tasks.
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm space-y-4">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#F9F6F0] hover:bg-[#e8e4db] text-[#475569] rounded-xl font-medium transition-colors border border-white/40"
          >
            <Download size={20} />
            Export Data
          </button>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl font-medium transition-colors border border-red-100"
          >
            <Trash2 size={20} />
            Reset Challenge
          </button>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Bell, Download, Trash2, AlertTriangle, Plus, X, CheckSquare, Settings as SettingsIcon, FileJson } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COUNTDOWN_SECONDS = 3;

export default function Settings() {
  const { state, updateProfile, resetChallenge, updateAdditionalTasksList, chooseStorageFolder, clearStorageFolder, folderName } = useStore();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  
  const [additionalTasks, setAdditionalTasks] = useState<string[]>(state.additionalTasksList || []);
  const [newTaskName, setNewTaskName] = useState('');
  const [showTaskWarningModal, setShowTaskWarningModal] = useState(false);
  const [taskWarningCountdown, setTaskWarningCountdown] = useState(COUNTDOWN_SECONDS);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [storageType, setStorageType] = useState<'default' | 'folder'>(folderName ? 'folder' : 'default');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showResetModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showResetModal, countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showTaskWarningModal && taskWarningCountdown > 0) {
      timer = setTimeout(() => setTaskWarningCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showTaskWarningModal, taskWarningCountdown]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile(e.target.value, state.remindersEnabled);
  };

  const handleRemindersToggle = () => {
    updateProfile(state.profileName, !state.remindersEnabled);
  };

  const handleAddTask = () => {
    if (newTaskName.trim() && !additionalTasks.includes(newTaskName.trim())) {
      setAdditionalTasks([...additionalTasks, newTaskName.trim()]);
      setNewTaskName('');
    }
  };

  const handleRemoveTask = (task: string) => {
    setAdditionalTasks(additionalTasks.filter(t => t !== task));
  };

  const handleSaveTasks = () => {
    if (!state.startDate) {
      updateAdditionalTasksList(additionalTasks, false);
      navigate('/');
    } else {
      setShowTaskWarningModal(true);
      setTaskWarningCountdown(COUNTDOWN_SECONDS);
    }
  };

  const confirmRestartWithTasks = () => {
    updateAdditionalTasksList(additionalTasks, true);
    setShowTaskWarningModal(false);
    navigate('/');
  };

  const confirmContinueWithTasks = () => {
    updateAdditionalTasksList(additionalTasks, false);
    setShowTaskWarningModal(false);
    navigate('/');
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
    setCountdown(COUNTDOWN_SECONDS);
  };

  const confirmReset = () => {
    resetChallenge();
    setAdditionalTasks([]);
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

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckSquare size={24} />
            </div>
            <h2 className="text-lg font-medium text-foreground">Additional Tasks</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted-hover text-muted-foreground rounded-xl font-medium transition-colors border border-border/30"
            >
              <Plus size={20} />
              Add New Task
            </button>

            {additionalTasks.length > 0 && (
              <div className="space-y-2 mt-4">
                {additionalTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-xl border border-border/30">
                    <span className="text-foreground font-medium">{task}</span>
                    <button
                      onClick={() => handleRemoveTask(task)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveTasks}
              className="w-full py-3 bg-secondary hover:bg-secondary-hover text-secondary-foreground rounded-full font-semibold transition-all shadow-sm mt-4"
            >
              Save Tasks
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-red-500 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h2>
          <button
            onClick={() => setShowStorageModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-colors border border-border/30"
          >
            <SettingsIcon size={20} />
            Change Storage Location
          </button>
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
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60"
            >
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4 text-center">Add New Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground/80 font-medium mb-1 block">Task Name</label>
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskName.trim()) {
                        handleAddTask();
                        setShowAddTaskModal(false);
                      }
                    }}
                    placeholder="E.g., Meditate for 10 mins"
                    className="w-full bg-muted border border-border/30 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddTaskModal(false);
                      setNewTaskName('');
                    }}
                    className="flex-1 py-3 px-4 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleAddTask();
                      setShowAddTaskModal(false);
                    }}
                    disabled={!newTaskName.trim()}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTaskWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60 text-center"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Challenge in Progress</h2>
              <p className="text-muted-foreground text-sm mb-6">
                You have added new tasks while a challenge is already running. Would you like to restart the challenge with these new tasks, or continue your current progress?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmContinueWithTasks}
                  className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-all shadow-md"
                >
                  Continue Current Challenge
                </button>
                <button
                  onClick={confirmRestartWithTasks}
                  disabled={taskWarningCountdown > 0}
                  className={`w-full py-3 px-4 rounded-full font-medium transition-all shadow-md ${
                    taskWarningCountdown > 0 
                      ? 'bg-red-300 text-white cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {taskWarningCountdown > 0 ? `Wait (${taskWarningCountdown}s)` : 'Restart Challenge'}
                </button>
                <button
                  onClick={() => setShowTaskWarningModal(false)}
                  className="w-full py-3 px-4 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-all mt-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-secondary hover:bg-secondary-hover text-secondary-foreground rounded-full font-medium transition-all shadow-md"
                >
                  <Download size={20} />
                  Download Data
                </button>
                <button
                  onClick={confirmReset}
                  disabled={countdown > 0}
                  className={`w-full py-3 px-4 rounded-full font-medium transition-all shadow-md ${
                    countdown > 0 
                      ? 'bg-red-300 text-white cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {countdown > 0 ? `Wait (${countdown}s)` : 'Erase and Continue'}
                </button>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-3 px-4 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-all mt-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showStorageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/60"
            >
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4 text-center">Storage Location</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Choose where your challenge data is saved.
              </p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setStorageType('default');
                    clearStorageFolder();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    storageType === 'default'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted hover:bg-muted-hover'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${storageType === 'default' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                    <SettingsIcon size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Browser Default</div>
                    <div className="text-xs text-muted-foreground">Saved in your browser</div>
                  </div>
                </button>

                <button
                  onClick={async () => {
                    setStorageType('folder');
                    try {
                      await chooseStorageFolder();
                      setShowStorageModal(false);
                    } catch (error) {
                      console.error("Failed to choose file:", error);
                      setStorageType('default');
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    storageType === 'folder'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted hover:bg-muted-hover'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${storageType === 'folder' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                    <FileJson size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">Choose File</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {folderName || 'Select a local file'}
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStorageModal(false)}
                  className="flex-1 py-3 bg-muted hover:bg-muted-hover text-muted-foreground rounded-full font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

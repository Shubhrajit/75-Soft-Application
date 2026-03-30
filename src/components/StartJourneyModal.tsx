import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, FileJson, HardDrive } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

interface StartJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartJourneyModal({ isOpen, onClose }: StartJourneyModalProps) {
  const { state, startChallenge, chooseStorageFolder, clearStorageFolder, folderName } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState(state.profileName || 'Challenger');
  const [additionalTasks, setAdditionalTasks] = useState<string[]>(state.additionalTasksList || []);
  const [newTaskName, setNewTaskName] = useState('');
  const [storageType, setStorageType] = useState<'default' | 'folder'>(folderName ? 'folder' : 'default');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(folderName);

  const handleAddTask = () => {
    if (newTaskName.trim() && !additionalTasks.includes(newTaskName.trim())) {
      setAdditionalTasks([...additionalTasks, newTaskName.trim()]);
      setNewTaskName('');
    }
  };

  const handleRemoveTask = (task: string) => {
    setAdditionalTasks(additionalTasks.filter(t => t !== task));
  };

  const handleChooseFolder = async () => {
    const name = await chooseStorageFolder();
    if (name) {
      setStorageType('folder');
      setSelectedFolder(name);
    } else {
      setStorageType('default');
      clearStorageFolder();
    }
  };

  const handleSelectDefault = () => {
    setStorageType('default');
    clearStorageFolder();
  };

  const handleStart = () => {
    startChallenge(name.trim() || 'Challenger', additionalTasks);
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
            <h2 className="text-2xl font-serif font-bold text-foreground">Prepare Your Journey</h2>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Challenger Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-muted border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Storage Location</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSelectDefault}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    storageType === 'default' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border/50 bg-muted hover:bg-muted-hover text-muted-foreground'
                  }`}
                >
                  <HardDrive size={24} />
                  <span className="text-sm font-medium">Browser Default</span>
                </button>
                <button
                  onClick={handleChooseFolder}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    storageType === 'folder' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border/50 bg-muted hover:bg-muted-hover text-muted-foreground'
                  }`}
                >
                  <FileJson size={24} />
                  <span className="text-sm font-medium text-center">
                    {storageType === 'folder' && selectedFolder ? selectedFolder : 'Choose File'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {storageType === 'default' 
                  ? 'Data is saved in your browser. It may be cleared if you clear browsing data.' 
                  : 'Data will be continuously saved to the selected file.'}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Additional Daily Tasks (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="e.g., Meditate 10 mins"
                  className="flex-1 p-3 bg-muted border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskName.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {additionalTasks.length > 0 && (
                <ul className="space-y-2 mt-3">
                  {additionalTasks.map((task) => (
                    <li key={task} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl text-sm">
                      <span>{task}</span>
                      <button
                        onClick={() => handleRemoveTask(task)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-border/50 bg-muted/30">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold text-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Begin Challenge
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

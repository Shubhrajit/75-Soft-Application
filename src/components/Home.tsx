import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { Check, Droplets, Camera, BookOpen, Briefcase, UtensilsCrossed, WineOff, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityType } from '../types';

export default function Home() {
  const { state, currentDayNumber, updateTask, getConsecutiveWorkouts, endDay } = useStore();
  const [showRecoveryWarning, setShowRecoveryWarning] = useState(false);
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const todayRecord = state.records[currentDayNumber];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showEndDayModal && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showEndDayModal, countdown]);

  if (!todayRecord) return null;

  const tasks = todayRecord.tasks;
  const consecutiveWorkouts = getConsecutiveWorkouts(currentDayNumber);
  const canActiveRecovery = consecutiveWorkouts >= 6;

  const getCompletionPercentage = () => {
    if (!tasks) return 0;
    let completed = 0;
    if (tasks.noOutsideFood) completed++;
    if (tasks.activity.completed) completed++;
    if (tasks.water === 3) completed++;
    if (tasks.noAlcohol) completed++;
    if (tasks.read10Pages) completed++;
    if (tasks.progressPhoto) completed++;
    if (tasks.jobReferral) completed++;
    return Math.round((completed / 7) * 100);
  };

  const percentage = getCompletionPercentage();

  const toggleTask = (key: keyof typeof tasks) => {
    if (key === 'activity' || key === 'water') return;
    updateTask(currentDayNumber, key, !tasks[key]);
  };

  const handleWater = () => {
    const nextWater = tasks.water >= 3 ? 0 : tasks.water + 1;
    updateTask(currentDayNumber, 'water', nextWater);
  };

  const handleActivity = (type: ActivityType) => {
    if (type === 'Active Recovery' && !canActiveRecovery) {
      setShowRecoveryWarning(true);
      return;
    }
    if (tasks.activity.type === type && tasks.activity.completed) {
      updateTask(currentDayNumber, 'activity', { type: null, completed: false });
    } else {
      updateTask(currentDayNumber, 'activity', { type: type, completed: true });
    }
  };

  const confirmActiveRecovery = () => {
    setShowRecoveryWarning(false);
    updateTask(currentDayNumber, 'activity', { type: 'Active Recovery', completed: true });
  };

  const handleEndDayClick = () => {
    setShowEndDayModal(true);
    setCountdown(3);
  };

  const confirmEndDay = () => {
    endDay();
    setShowEndDayModal(false);
  };

  const TaskCard = ({
    title,
    icon: Icon,
    completed,
    time,
    onClick,
    children,
  }: {
    title: string;
    icon: any;
    completed: boolean;
    time?: string;
    onClick?: () => void;
    children?: React.ReactNode;
  }) => (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={cn(
        "p-5 rounded-3xl mb-4 transition-all duration-300 cursor-pointer border shadow-sm",
        completed
          ? "bg-[#B2C8BA]/20 border-[#B2C8BA]/50"
          : "bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              completed ? "bg-[#B2C8BA] text-white" : "bg-[#F9F6F0] text-[#475569]/50"
            )}
          >
            <Icon size={24} />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-lg font-medium", completed ? "text-[#475569]" : "text-[#475569]/80")}>
              {title}
            </span>
            {time && (
              <span className="text-xs text-[#475569]/60 font-medium mt-0.5">
                {time}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
            completed ? "bg-[#B2C8BA] border-[#B2C8BA] text-white" : "border-[#475569]/20"
          )}
        >
          {completed && <Check size={16} strokeWidth={3} />}
        </div>
      </div>
      {children}
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <header className="mb-8 flex items-center justify-between pt-4">
        <div className="text-left">
          <h1 className="text-4xl font-serif font-bold text-[#B2C8BA] mb-2">Day {currentDayNumber}</h1>
          <p className="text-[#475569]/60 font-medium uppercase tracking-widest text-sm">Of 75 Soft</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#F9F6F0] stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <motion.circle
              className="text-[#B2C8BA] stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-[#475569]">{percentage}%</span>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <TaskCard
          title="No Outside Food"
          icon={UtensilsCrossed}
          completed={tasks.noOutsideFood}
          time={todayRecord.taskTimes?.noOutsideFood}
          onClick={() => toggleTask('noOutsideFood')}
        />

        <div className={cn(
          "p-5 rounded-3xl mb-4 transition-all duration-300 border shadow-sm",
          tasks.activity.completed
            ? "bg-[#B2C8BA]/20 border-[#B2C8BA]/50"
            : "bg-white/60 backdrop-blur-md border-white/40"
        )}>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                tasks.activity.completed ? "bg-[#B2C8BA] text-white" : "bg-[#F9F6F0] text-[#475569]/50"
              )}
            >
              <Activity size={24} />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-lg font-medium", tasks.activity.completed ? "text-[#475569]" : "text-[#475569]/80")}>
                45 Min Activity
              </span>
              {todayRecord.taskTimes?.activity && (
                <span className="text-xs text-[#475569]/60 font-medium mt-0.5">
                  {todayRecord.taskTimes.activity}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['Walking', 'Workout', 'Swimming', 'Gym'] as ActivityType[]).map((type) => (
              <button
                key={type!}
                onClick={() => handleActivity(type)}
                className={cn(
                  "py-2 px-3 rounded-xl text-sm font-medium transition-all",
                  tasks.activity.type === type
                    ? "bg-[#B2C8BA] text-white shadow-md"
                    : "bg-[#F9F6F0] text-[#475569]/70 hover:bg-[#e8e4db]"
                )}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => handleActivity('Active Recovery')}
              className={cn(
                "col-span-2 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                tasks.activity.type === 'Active Recovery'
                  ? "bg-[#D6CDEA] text-[#475569] shadow-md"
                  : "bg-[#F9F6F0] text-[#475569]/70 hover:bg-[#e8e4db]"
              )}
            >
              Active Recovery
            </button>
          </div>
        </div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            "p-5 rounded-3xl mb-4 transition-all duration-300 cursor-pointer border shadow-sm",
            tasks.water === 3
              ? "bg-[#B2C8BA]/20 border-[#B2C8BA]/50"
              : "bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/80"
          )}
          onClick={handleWater}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  tasks.water === 3 ? "bg-[#B2C8BA] text-white" : "bg-[#F9F6F0] text-[#475569]/50"
                )}
              >
                <Droplets size={24} />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-lg font-medium block", tasks.water === 3 ? "text-[#475569]" : "text-[#475569]/80")}>
                  3L Water
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {todayRecord.taskTimes?.water ? (
                    todayRecord.taskTimes.water.split(',').map((time, idx) => (
                      <span key={idx} className="text-xs text-[#475569]/60 font-medium">
                        • {idx + 1}L at {time}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#475569]/50">0 / 3 Liters</span>
                  )}
                </div>
              </div>
            </div>
            <div className="relative w-14 h-14 rounded-full border-2 border-[#B2C8BA]/30 bg-[#F9F6F0] overflow-hidden flex-shrink-0 shadow-inner">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-[#B2C8BA]"
                initial={{ height: "0%" }}
                animate={{ height: `${(tasks.water / 3) * 100}%` }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className={cn("font-bold text-sm", tasks.water > 1 ? "text-white" : "text-[#475569]")}>
                  {tasks.water}/3L
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <TaskCard
          title="No Alcohol"
          icon={WineOff}
          completed={tasks.noAlcohol}
          time={todayRecord.taskTimes?.noAlcohol}
          onClick={() => toggleTask('noAlcohol')}
        />
        <TaskCard
          title="Read 10 Pages"
          icon={BookOpen}
          completed={tasks.read10Pages}
          time={todayRecord.taskTimes?.read10Pages}
          onClick={() => toggleTask('read10Pages')}
        />
        <TaskCard
          title="Progress Photo"
          icon={Camera}
          completed={tasks.progressPhoto}
          time={todayRecord.taskTimes?.progressPhoto}
          onClick={() => toggleTask('progressPhoto')}
        />
        <TaskCard
          title="1 Job Referral"
          icon={Briefcase}
          completed={tasks.jobReferral}
          time={todayRecord.taskTimes?.jobReferral}
          onClick={() => toggleTask('jobReferral')}
        />
      </div>

      <div className="mt-8 mb-4">
        <button
          onClick={handleEndDayClick}
          className="w-full py-4 bg-[#475569] hover:bg-[#334155] text-white rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          End Day {currentDayNumber}
        </button>
      </div>

      <AnimatePresence>
        {showEndDayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#475569]/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#475569] mb-2">End Day {currentDayNumber}?</h2>
              <p className="text-[#475569]/70 text-sm mb-6">
                Are you sure you want to log today's progress and start the next day? You won't be able to edit today's tasks after this.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndDayModal(false)}
                  className="flex-1 py-3 px-4 bg-[#F9F6F0] hover:bg-[#e8e4db] text-[#475569] rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndDay}
                  disabled={countdown > 0}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all shadow-md ${
                    countdown > 0 
                      ? 'bg-blue-300 text-white cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {countdown > 0 ? `Wait (${countdown}s)` : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRecoveryWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#475569]/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#475569] mb-2">Soft Fail Warning</h2>
              <p className="text-[#475569]/70 text-sm mb-8">
                You haven't completed 6 consecutive workouts. Using Active Recovery today will result in a Soft Fail. Are you sure you want to proceed?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecoveryWarning(false)}
                  className="flex-1 py-3 px-4 bg-[#F9F6F0] hover:bg-[#e8e4db] text-[#475569] rounded-xl font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmActiveRecovery}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-md"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

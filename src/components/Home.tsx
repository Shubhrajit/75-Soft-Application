import React from 'react';
import { useStore } from '../StoreContext';
import { cn } from '../lib/utils';
import { Check, Droplets, Camera, BookOpen, Briefcase, UtensilsCrossed, WineOff, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityType } from '../store';

export default function Home() {
  const { state, currentDayNumber, updateTask, getConsecutiveWorkouts } = useStore();
  const todayRecord = state.records[currentDayNumber];

  if (!todayRecord) return null;

  const tasks = todayRecord.tasks;
  const consecutiveWorkouts = getConsecutiveWorkouts(currentDayNumber);
  const canActiveRecovery = consecutiveWorkouts >= 6;

  const toggleTask = (key: keyof typeof tasks) => {
    if (key === 'activity' || key === 'water') return;
    updateTask(currentDayNumber, key, !tasks[key]);
  };

  const handleWater = () => {
    const nextWater = tasks.water >= 3 ? 0 : tasks.water + 1;
    updateTask(currentDayNumber, 'water', nextWater);
  };

  const handleActivity = (type: ActivityType) => {
    if (tasks.activity.type === type && tasks.activity.completed) {
      updateTask(currentDayNumber, 'activity', { type: null, completed: false });
    } else {
      updateTask(currentDayNumber, 'activity', { type, completed: true });
    }
  };

  const TaskCard = ({
    title,
    icon: Icon,
    completed,
    onClick,
    children,
  }: {
    title: string;
    icon: any;
    completed: boolean;
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
          <span className={cn("text-lg font-medium", completed ? "text-[#475569]" : "text-[#475569]/80")}>
            {title}
          </span>
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
      <header className="mb-8 text-center pt-4">
        <h1 className="text-4xl font-serif font-bold text-[#B2C8BA] mb-2">Day {currentDayNumber}</h1>
        <p className="text-[#475569]/60 font-medium uppercase tracking-widest text-sm">Of 75 Soft</p>
      </header>

      <div className="space-y-4">
        <TaskCard
          title="No Outside Food"
          icon={UtensilsCrossed}
          completed={tasks.noOutsideFood}
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
            <span className={cn("text-lg font-medium", tasks.activity.completed ? "text-[#475569]" : "text-[#475569]/80")}>
              45 Min Activity
            </span>
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
              {!canActiveRecovery && <span className="text-[10px] uppercase tracking-wider text-red-400">(Soft Fail if used)</span>}
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
              <div>
                <span className={cn("text-lg font-medium block", tasks.water === 3 ? "text-[#475569]" : "text-[#475569]/80")}>
                  3L Water
                </span>
                <span className="text-sm text-[#475569]/50">{tasks.water} / 3 Liters</span>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((drop) => (
                <div
                  key={drop}
                  className={cn(
                    "w-3 h-8 rounded-full transition-colors",
                    tasks.water >= drop ? "bg-[#B2C8BA]" : "bg-[#475569]/10"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <TaskCard
          title="No Alcohol"
          icon={WineOff}
          completed={tasks.noAlcohol}
          onClick={() => toggleTask('noAlcohol')}
        />
        <TaskCard
          title="Read 10 Pages"
          icon={BookOpen}
          completed={tasks.read10Pages}
          onClick={() => toggleTask('read10Pages')}
        />
        <TaskCard
          title="Progress Photo"
          icon={Camera}
          completed={tasks.progressPhoto}
          onClick={() => toggleTask('progressPhoto')}
        />
        <TaskCard
          title="1 Job Referral"
          icon={Briefcase}
          completed={tasks.jobReferral}
          onClick={() => toggleTask('jobReferral')}
        />
      </div>
    </motion.div>
  );
}

import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { state, currentDayNumber } = useStore();

  const todayRecord = state.records[currentDayNumber];
  const tasks = todayRecord?.tasks;

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

  // Calculate fail reasons
  const failReasonsCount = Object.values(state.records).reduce((acc, record: any) => {
    if (record.isFailed && record.failReason) {
      acc[record.failReason] = (acc[record.failReason] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(failReasonsCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#B2C8BA', '#D6CDEA', '#F9F6F0', '#475569', '#A1B8A9'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <header className="mb-8 text-center pt-4">
        <h1 className="text-3xl font-serif font-bold text-[#475569] mb-2">Dashboard</h1>
        <p className="text-[#475569]/60 font-medium text-sm">Your Progress Overview</p>
      </header>

      <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm mb-6 text-center">
        <h2 className="text-lg font-medium text-[#475569]/80 mb-4">Today's Completion</h2>
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#F9F6F0] stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-[#B2C8BA] stroke-current transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#475569]">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm mb-6">
        <h2 className="text-lg font-medium text-[#475569]/80 mb-4">75-Day Journey</h2>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: 75 }).map((_, i) => {
            const day = i + 1;
            const record = state.records[day];
            let statusClass = "bg-[#F9F6F0] border-[#475569]/10"; // Future
            
            if (record) {
              if (record.isFailed) {
                statusClass = "bg-[#D6CDEA] border-[#D6CDEA]/50"; // Failed
              } else if (day < currentDayNumber) {
                statusClass = "bg-[#B2C8BA] border-[#B2C8BA]/50"; // Completed past
              } else if (day === currentDayNumber) {
                statusClass = percentage === 100 ? "bg-[#B2C8BA] border-[#B2C8BA]/50" : "bg-white border-[#B2C8BA] border-2"; // Today
              }
            }

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square rounded-md border transition-all",
                  statusClass
                )}
                title={`Day ${day}`}
              />
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs text-[#475569]/60">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#B2C8BA]"></div> Pass</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#D6CDEA]"></div> Fail</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#F9F6F0] border"></div> Pending</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
          <h2 className="text-lg font-medium text-[#475569]/80 mb-4">Root Cause Analysis</h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs text-[#475569]/80">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

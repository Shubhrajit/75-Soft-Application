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

  const COLORS = ['#9CB4A1', '#E8D5EB', '#F2EFEA', '#4A4745', '#8AA38F'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-10">
      <header className="mb-8 text-center pt-4">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground font-medium text-sm">Your Progress Overview</p>
      </header>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm mb-6">
        <h2 className="text-lg font-medium text-foreground mb-4">75-Day Journey</h2>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: 75 }).map((_, i) => {
            const day = i + 1;
            const record = state.records[day];
            let statusClass = "bg-muted border-border/20"; // Future
            
            if (record) {
              if (record.isFailed) {
                statusClass = "bg-accent border-accent/50"; // Failed
              } else if (day < currentDayNumber) {
                statusClass = "bg-primary border-primary/50"; // Completed past
              } else if (day === currentDayNumber) {
                statusClass = percentage === 100 ? "bg-primary border-primary/50" : "bg-white border-primary border-2"; // Today
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
        <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary"></div> Pass</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-accent"></div> Fail</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted border border-border/30"></div> Pending</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
          <h2 className="text-lg font-medium text-foreground mb-4">Root Cause Analysis</h2>
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
                  itemStyle={{ color: '#1D1C1B' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs text-muted-foreground">
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

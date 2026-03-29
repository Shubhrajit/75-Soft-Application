import { useStore } from '../StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { FailReason } from '../store';

export default function PostMortemModal() {
  const { checkFailures, submitFailReason } = useStore();
  const failedDay = checkFailures();

  if (failedDay === null) return null;

  const reasons: FailReason[] = [
    'Time Management',
    'Energy',
    'Social Pressure',
    'Forgetfulness',
    'Other',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#475569]/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-sm bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D6CDEA]/30 text-[#D6CDEA] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              💔
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#475569] mb-2">Streak Broken</h2>
            <p className="text-[#475569]/70 text-sm">
              You missed some tasks on Day {failedDay}. Let's understand why to do better next time.
            </p>
          </div>

          <div className="space-y-3">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => submitFailReason(failedDay, reason)}
                className="w-full py-4 px-6 bg-[#F9F6F0] hover:bg-[#e8e4db] text-[#475569] rounded-2xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95 text-left flex justify-between items-center group"
              >
                {reason}
                <span className="text-[#B2C8BA] opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

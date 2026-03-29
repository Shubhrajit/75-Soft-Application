import { useState, useEffect } from 'react';
import { startOfDay, differenceInDays, isSameDay, addDays } from 'date-fns';

export type ActivityType = 'Walking' | 'Workout' | 'Swimming' | 'Gym' | 'Active Recovery' | null;
export type FailReason = 'Time Management' | 'Energy' | 'Social Pressure' | 'Forgetfulness' | 'Other';

export interface DailyTasks {
  noOutsideFood: boolean;
  activity: {
    type: ActivityType;
    completed: boolean;
  };
  water: number; // 0 to 3
  noAlcohol: boolean;
  read10Pages: boolean;
  progressPhoto: boolean;
  jobReferral: boolean;
}

export interface DailyRecord {
  day: number;
  date: string; // ISO string
  tasks: DailyTasks;
  isFailed: boolean;
  failReason?: FailReason;
}

export interface AppState {
  startDate: string | null;
  records: Record<number, DailyRecord>;
  profileName: string;
  remindersEnabled: boolean;
}

const defaultTasks: DailyTasks = {
  noOutsideFood: false,
  activity: { type: null, completed: false },
  water: 0,
  noAlcohol: false,
  read10Pages: false,
  progressPhoto: false,
  jobReferral: false,
};

const initialState: AppState = {
  startDate: null,
  records: {},
  profileName: 'Challenger',
  remindersEnabled: true,
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('75soft-state');
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem('75soft-state', JSON.stringify(state));
  }, [state]);

  const startChallenge = () => {
    setState({
      ...initialState,
      startDate: startOfDay(new Date()).toISOString(),
      profileName: state.profileName,
      remindersEnabled: state.remindersEnabled,
      records: {
        1: {
          day: 1,
          date: startOfDay(new Date()).toISOString(),
          tasks: { ...defaultTasks },
          isFailed: false,
        },
      },
    });
  };

  const resetChallenge = () => {
    setState({
      ...initialState,
      profileName: state.profileName,
      remindersEnabled: state.remindersEnabled,
    });
  };

  const updateProfile = (name: string, reminders: boolean) => {
    setState((s) => ({ ...s, profileName: name, remindersEnabled: reminders }));
  };

  const currentDayNumber = state.startDate
    ? differenceInDays(startOfDay(new Date()), new Date(state.startDate)) + 1
    : 0;

  // Initialize missing days up to current day and check past days
  useEffect(() => {
    if (!state.startDate) return;

    setState((s) => {
      let updated = false;
      const newRecords = { ...s.records };

      for (let i = 1; i <= currentDayNumber; i++) {
        if (!newRecords[i]) {
          newRecords[i] = {
            day: i,
            date: addDays(new Date(s.startDate!), i - 1).toISOString(),
            tasks: { ...defaultTasks },
            isFailed: i < currentDayNumber, // Past days are failed if not completed
          };
          updated = true;
        } else if (i < currentDayNumber && !newRecords[i].isFailed) {
          // Check if an existing past day was completed
          const record = newRecords[i];
          let isCompleted =
            record.tasks.noOutsideFood &&
            record.tasks.activity.completed &&
            record.tasks.water === 3 &&
            record.tasks.noAlcohol &&
            record.tasks.read10Pages &&
            record.tasks.progressPhoto &&
            record.tasks.jobReferral;

          if (isCompleted && record.tasks.activity.type === 'Active Recovery') {
            let consecutiveWorkouts = 0;
            for (let j = i - 1; j >= 1; j--) {
              const pastRecord = newRecords[j];
              if (pastRecord && pastRecord.tasks.activity.completed && pastRecord.tasks.activity.type !== 'Active Recovery') {
                consecutiveWorkouts++;
              } else {
                break;
              }
            }
            if (consecutiveWorkouts < 6) {
              isCompleted = false;
            }
          }

          if (!isCompleted) {
            newRecords[i] = { ...record, isFailed: true };
            updated = true;
          }
        }
      }

      if (updated) {
        return { ...s, records: newRecords };
      }
      return s;
    });
  }, [currentDayNumber, state.startDate]);

  const updateTask = (day: number, taskKey: keyof DailyTasks, value: any) => {
    setState((s) => {
      const record = s.records[day];
      if (!record) return s;
      return {
        ...s,
        records: {
          ...s.records,
          [day]: {
            ...record,
            tasks: {
              ...record.tasks,
              [taskKey]: value,
            },
          },
        },
      };
    });
  };

  const submitFailReason = (day: number, reason: FailReason) => {
    setState((s) => {
      const record = s.records[day];
      if (!record) return s;
      return {
        ...s,
        records: {
          ...s.records,
          [day]: {
            ...record,
            isFailed: true,
            failReason: reason,
          },
        },
      };
    });
  };

  const checkFailures = () => {
    if (!state.startDate) return null;
    // Find the first past day that is failed but has no reason
    for (let i = 1; i < currentDayNumber; i++) {
      const record = state.records[i];
      if (record) {
        let isCompleted =
          record.tasks.noOutsideFood &&
          record.tasks.activity.completed &&
          record.tasks.water === 3 &&
          record.tasks.noAlcohol &&
          record.tasks.read10Pages &&
          record.tasks.progressPhoto &&
          record.tasks.jobReferral;

        if (isCompleted && record.tasks.activity.type === 'Active Recovery') {
          const consecutiveWorkouts = getConsecutiveWorkouts(i);
          if (consecutiveWorkouts < 6) {
            isCompleted = false;
          }
        }

        if (!isCompleted && !record.failReason) {
          return i; // Return the day number that needs a post-mortem
        }
      }
    }
    return null;
  };

  const getConsecutiveWorkouts = (day: number) => {
    let count = 0;
    for (let i = day - 1; i >= 1; i--) {
      const record = state.records[i];
      if (record && record.tasks.activity.completed && record.tasks.activity.type !== 'Active Recovery') {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  return {
    state,
    startChallenge,
    resetChallenge,
    updateProfile,
    updateTask,
    submitFailReason,
    checkFailures,
    currentDayNumber,
    getConsecutiveWorkouts,
  };
}

import { useState, useEffect } from 'react';
import { startOfDay, differenceInDays, addDays } from 'date-fns';
import { AppState, DailyTasks, FailReason, ActivityType } from '../types';

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
  dayOffset: 0,
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('75soft-state');
      return saved ? JSON.parse(saved) : initialState;
    } catch (e) {
      console.error('Failed to parse local storage data', e);
      return initialState;
    }
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
      dayOffset: 0,
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
    localStorage.removeItem('75soft-state');
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
    ? differenceInDays(startOfDay(new Date()), new Date(state.startDate)) + 1 + (state.dayOffset || 0)
    : 0;

  const endDay = () => {
    setState((s) => ({ ...s, dayOffset: (s.dayOffset || 0) + 1 }));
  };

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
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setState((s) => {
      const record = s.records[day];
      if (!record) return s;

      let isCompleted = false;
      if (typeof value === 'boolean') isCompleted = value;
      else if (taskKey === 'activity') isCompleted = value.completed;
      else if (taskKey === 'water') isCompleted = value > 0;

      const newTaskTimes = { ...(record.taskTimes || {}) };
      if (isCompleted) {
        newTaskTimes[taskKey] = now;
      } else {
        delete newTaskTimes[taskKey];
      }

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
            taskTimes: newTaskTimes,
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
    endDay,
  };
}

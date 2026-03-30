import { useState, useEffect } from 'react';
import { startOfDay, differenceInDays, addDays } from 'date-fns';
import { get, set, del } from 'idb-keyval';
import { AppState, DailyTasks, FailReason, ActivityType } from '../types';

const defaultTasks: DailyTasks = {
  noOutsideFood: false,
  activity: { type: null, completed: false },
  water: 0,
  noAlcohol: false,
  read10Pages: false,
  additionalTasks: {},
};

const initialState: AppState = {
  startDate: null,
  records: {},
  profileName: 'Challenger',
  remindersEnabled: true,
  dayOffset: 0,
  additionalTasksList: [],
};

export function useAppStore() {
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [folderName, setFolderName] = useState<string | null>(null);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('75soft-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
      return initialState;
    } catch (e) {
      console.error('Failed to parse local storage data', e);
      return initialState;
    }
  });

  useEffect(() => {
    const loadHandle = async () => {
      try {
        const handle = await get('75soft-file-handle');
        if (handle) {
          // @ts-ignore
          if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') {
            setFileHandle(handle);
            setFolderName(handle.name);
          } else {
            // We have the handle but lack permission. We can't request it without a user gesture.
            // For now, we'll keep it in state, but writing might fail or prompt.
            setFileHandle(handle);
            setFolderName(handle.name);
          }
        }
      } catch (err) {
        console.error('Failed to load file handle from IDB', err);
      }
    };
    loadHandle();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('75soft-state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to local storage', e);
    }

    if (fileHandle) {
      const saveToFile = async () => {
        try {
          // @ts-ignore
          if (await fileHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
            // @ts-ignore
            await fileHandle.requestPermission({ mode: 'readwrite' });
          }
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(state, null, 2));
          await writable.close();
        } catch (err) {
          console.error('Failed to write to file handle', err);
        }
      };
      saveToFile();
    }
  }, [state, fileHandle]);

  const chooseStorageFolder = async () => {
    try {
      if (!('showSaveFilePicker' in window)) {
        alert('File selection is not supported in this browser. Using default storage.');
        return false;
      }
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: '75soft-data.json',
        types: [{
          description: 'JSON File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      
      try {
        const file = await handle.getFile();
        const text = await file.text();
        if (text) {
          const data = JSON.parse(text);
          if (data && data.records) {
            setState(data);
          }
        }
      } catch (e) {
        console.log('Starting fresh in this file.');
      }

      setFileHandle(handle);
      setFolderName(handle.name);
      await set('75soft-file-handle', handle);
      return handle.name;
    } catch (err) {
      console.error('User cancelled or failed to open file picker', err);
      return false;
    }
  };

  const clearStorageFolder = async () => {
    setFileHandle(null);
    setFolderName(null);
    await del('75soft-file-handle');
  };

  const startChallenge = (profileName?: string, additionalTasks?: string[]) => {
    setState({
      ...initialState,
      startDate: startOfDay(new Date()).toISOString(),
      profileName: profileName || state.profileName,
      remindersEnabled: state.remindersEnabled,
      dayOffset: 0,
      additionalTasksList: additionalTasks || state.additionalTasksList,
      records: {
        1: {
          day: 1,
          date: startOfDay(new Date()).toISOString(),
          tasks: { ...defaultTasks, additionalTasks: (additionalTasks || state.additionalTasksList || []).reduce((acc, t) => ({ ...acc, [t]: false }), {}) },
          isFailed: false,
        },
      },
    });
  };

  const resetChallenge = async () => {
    localStorage.removeItem('75soft-state');
    setState({
      ...initialState,
      profileName: state.profileName,
      remindersEnabled: state.remindersEnabled,
    });
    setFileHandle(null);
    setFolderName(null);
    await del('75soft-file-handle');
  };

  const updateProfile = (name: string, reminders: boolean) => {
    setState((s) => ({ ...s, profileName: name, remindersEnabled: reminders }));
  };

  const updateAdditionalTasksList = (tasks: string[], restart: boolean = false) => {
    setState((s) => {
      if (restart) {
        return {
          ...initialState,
          startDate: startOfDay(new Date()).toISOString(),
          profileName: s.profileName,
          remindersEnabled: s.remindersEnabled,
          dayOffset: 0,
          additionalTasksList: tasks,
          records: {
            1: {
              day: 1,
              date: startOfDay(new Date()).toISOString(),
              tasks: { ...defaultTasks, additionalTasks: (tasks || []).reduce((acc, t) => ({ ...acc, [t]: false }), {}) },
              isFailed: false,
            },
          },
        };
      } else {
        // Just update the list, and add to current day's tasks if not present
        const newRecords = { ...s.records };
        const currentDay = currentDayNumber;
        if (currentDay > 0 && newRecords[currentDay]) {
          const currentTasks = newRecords[currentDay].tasks.additionalTasks || {};
          const updatedTasks: Record<string, boolean> = {};
          
          // Only keep tasks that are in the new list
          tasks.forEach(t => {
            updatedTasks[t] = currentTasks[t] || false;
          });
          
          newRecords[currentDay] = {
            ...newRecords[currentDay],
            tasks: {
              ...newRecords[currentDay].tasks,
              additionalTasks: updatedTasks,
            }
          };
        }
        return { ...s, additionalTasksList: tasks, records: newRecords };
      }
    });
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
            tasks: { ...defaultTasks, additionalTasks: (s.additionalTasksList || []).reduce((acc, t) => ({ ...acc, [t]: false }), {}) },
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
            record.tasks.read10Pages;

          if (record.tasks.additionalTasks) {
            const additionalKeys = Object.keys(record.tasks.additionalTasks);
            for (const key of additionalKeys) {
              if (!record.tasks.additionalTasks[key]) {
                isCompleted = false;
                break;
              }
            }
          }

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

  const updateTask = (day: number, taskKey: keyof DailyTasks | string, value: any) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setState((s) => {
      const record = s.records[day];
      if (!record) return s;

      let isCompleted = false;
      if (typeof value === 'boolean') isCompleted = value;
      else if (taskKey === 'activity') isCompleted = value.completed;
      else if (taskKey === 'water') isCompleted = value > 0;

      const newTaskTimes = { ...(record.taskTimes || {}) };
      
      if (taskKey === 'water') {
        const oldWater = record.tasks.water;
        const newWater = value;
        if (newWater === 0) {
          delete newTaskTimes.water;
        } else if (newWater > oldWater) {
          const existingTimes = newTaskTimes.water ? newTaskTimes.water.split(',') : [];
          existingTimes.push(now);
          newTaskTimes.water = existingTimes.join(',');
        } else if (newWater < oldWater) {
          const existingTimes = newTaskTimes.water ? newTaskTimes.water.split(',') : [];
          existingTimes.pop();
          newTaskTimes.water = existingTimes.join(',');
        }
      } else if (isCompleted) {
        newTaskTimes[taskKey as string] = now;
      } else {
        delete newTaskTimes[taskKey as string];
      }

      if (s.additionalTasksList.includes(taskKey as string)) {
        return {
          ...s,
          records: {
            ...s.records,
            [day]: {
              ...record,
              tasks: {
                ...record.tasks,
                additionalTasks: {
                  ...(record.tasks.additionalTasks || {}),
                  [taskKey as string]: value,
                }
              },
              taskTimes: newTaskTimes,
            },
          },
        };
      }

      return {
        ...s,
        records: {
          ...s.records,
          [day]: {
            ...record,
            tasks: {
              ...record.tasks,
              [taskKey as keyof DailyTasks]: value,
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
          record.tasks.read10Pages;

        if (record.tasks.additionalTasks) {
          const additionalKeys = Object.keys(record.tasks.additionalTasks);
          for (const key of additionalKeys) {
            if (!record.tasks.additionalTasks[key]) {
              isCompleted = false;
              break;
            }
          }
        }

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

  const getCompletionPercentage = (day: number) => {
    const record = state.records[day];
    if (!record || !record.tasks) return 0;
    const tasks = record.tasks;
    let completed = 0;
    let total = 5;
    if (tasks.noOutsideFood) completed++;
    if (tasks.activity.completed) completed++;
    if (tasks.water === 3) completed++;
    if (tasks.noAlcohol) completed++;
    if (tasks.read10Pages) completed++;
    
    if (tasks.additionalTasks) {
      const additionalKeys = Object.keys(tasks.additionalTasks);
      total += additionalKeys.length;
      additionalKeys.forEach(key => {
        if (tasks.additionalTasks![key]) completed++;
      });
    }
    
    return Math.round((completed / total) * 100);
  };

  return {
    state,
    folderName,
    chooseStorageFolder,
    clearStorageFolder,
    startChallenge,
    resetChallenge,
    updateProfile,
    updateAdditionalTasksList,
    updateTask,
    submitFailReason,
    checkFailures,
    currentDayNumber,
    getConsecutiveWorkouts,
    getCompletionPercentage,
    endDay,
  };
}

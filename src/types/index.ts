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
  additionalTasks?: Record<string, boolean>;
}

export interface DailyRecord {
  day: number;
  date: string; // ISO string
  tasks: DailyTasks;
  taskTimes?: Record<string, string>;
  isFailed: boolean;
  failReason?: FailReason;
}

export interface AppState {
  startDate: string | null;
  records: Record<number, DailyRecord>;
  profileName: string;
  remindersEnabled: boolean;
  dayOffset: number;
  additionalTasksList: string[];
}

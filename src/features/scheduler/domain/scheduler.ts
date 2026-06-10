export type TrainingScheduleTemplate = {
  id: string;
  groupId: string;
  groupName: string;
  dayOfWeek: number;
  startTime: string;
  isActive: boolean;
};

export type TrainingSessionSummary = {
  id: string;
  groupId: string;
  groupName: string;
  date: string;
  time: string;
  type: "regular" | "extra";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  athleteCount: number;
  notes: string;
  cancellationReason: string;
};

export type TrainingGroupOption = {
  id: string;
  name: string;
};

export type SchedulerManagementView = {
  year: number;
  month: number;
  groups: TrainingGroupOption[];
  schedules: TrainingScheduleTemplate[];
  sessions: TrainingSessionSummary[];
};

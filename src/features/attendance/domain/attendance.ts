export const ATTENDANCE_STATUSES = ["present", "absent"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type AttendanceAthlete = {
  id: string;
  fullName: string;
  birthYear: number;
  currentBelt: string;
  existingStatus: AttendanceStatus;
  existingNote: string;
};

export type AttendanceSessionView = {
  sessionId: string;
  groupId: string;
  groupName: string;
  sessionDate: string;
  trainingTime: string;
  sessionType: "regular" | "extra";
  status: "scheduled" | "completed" | "rescheduled";
  notes: string;
  athletes: AttendanceAthlete[];
};

export type AttendanceTrainingOption = {
  sessionId: string;
  groupId: string;
  groupName: string;
  trainingTime: string;
  sessionType: "regular" | "extra";
  status: "scheduled" | "completed" | "rescheduled";
  expectedAthletes: number;
  session: AttendanceSessionView;
};

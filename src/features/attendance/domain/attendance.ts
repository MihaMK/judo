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
  sessionId: string | null;
  groupId: string;
  groupName: string;
  sessionDate: string;
  trainingTime?: string;
  notes: string;
  athletes: AttendanceAthlete[];
};

export type AttendanceTrainingOption = {
  groupId: string;
  groupName: string;
  trainingTime: string;
  expectedAthletes: number;
  session: AttendanceSessionView;
};

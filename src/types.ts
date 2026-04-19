
export interface Professor {
  id: string;
  name: string;
  department: string;
  /** Raw DB `compartment_qr` value (e.g. `open 8`). When set, all devices use this instead of localStorage. */
  compartmentQr?: string;
}

export interface SubmissionData {
  studentId: string;
  studentName: string;
  timestamp: string;
  cabinetId: string;
  status: 'Submitted' | 'Pending' | 'Collected';
}

export interface QrRecord {
  id: string;
  name: string;
  startsAt: string;
  expiresAt: string;
  generatedAt: string;
}

export enum AppState {
  LANDING = 'LANDING',
  PROF_SELECT = 'PROF_SELECT',
  DASHBOARD = 'DASHBOARD',
  DEV_LOGIN = 'DEV_LOGIN',
  DEV_DASHBOARD = 'DEV_DASHBOARD'
}

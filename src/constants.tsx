
import { Professor, SubmissionData } from './types';

export const PROFESSORS: Professor[] = [
  { id: '1', name: 'Dr. John Smith', department: 'CPE' },
  { id: '2', name: 'Engr. Maria Clara', department: 'CPE' },
  { id: '3', name: 'Prof. Alan Turing', department: 'CPE' },
  { id: '4', name: 'Dr. Ada Lovelace', department: 'CPE' },
  { id: '5', name: 'Engr. Jose Rizal', department: 'CPE' },
  { id: '6', name: 'Prof. Grace Hopper', department: 'CPE' },
  { id: '7', name: 'Dr. Nikola Tesla', department: 'CPE' },
  { id: '8', name: 'Engr. Hedy Lamarr', department: 'CPE' }
];

export const MOCK_SUBMISSIONS: SubmissionData[] = [
  { studentId: '2023-0001', studentName: 'Ricardo Dalisay', timestamp: '2023-10-24 08:30', cabinetId: 'CAB-01', status: 'Submitted' },
  { studentId: '2023-0005', studentName: 'Juan Dela Cruz', timestamp: '2023-10-24 09:15', cabinetId: 'CAB-03', status: 'Submitted' },
  { studentId: '2023-0012', studentName: 'Elena Gilbert', timestamp: '2023-10-24 10:05', cabinetId: 'CAB-07', status: 'Pending' },
  { studentId: '2023-0022', studentName: 'Peter Parker', timestamp: '2023-10-24 11:45', cabinetId: 'CAB-02', status: 'Submitted' },
  { studentId: '2023-0045', studentName: 'Tony Stark', timestamp: '2023-10-24 13:20', cabinetId: 'CAB-10', status: 'Collected' }
];

export const INITIAL_PIN = '123123';
export const PIN_STORAGE_KEY = 'acm_professor_pin';

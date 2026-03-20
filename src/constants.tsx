
import { Professor, SubmissionData } from './types';

export const PROFESSORS: Professor[] = [
  { id: '1', name: 'Engr. Dolores S. Agina', department: 'CPE' },
  { id: '2', name: 'Dr. Belinda G. Bunag', department: 'CPE' },
  { id: '3', name: 'Dr. Marife E. Gomez', department: 'CPE' },
  { id: '4', name: 'Engr. Emelita C. Presbitero', department: 'CPE' },
  { id: '5', name: 'Engr. Edwin G. Purisima', department: 'CPE' },
  { id: '6', name: 'Engr. Eugene M. Sadicon', department: 'CPE' },
  { id: '7', name: 'Engr. Christopher L. Zaplan', department: 'CPE' },
  { id: '8', name: 'Dr. Ma. Luisa M. Villanueva', department: 'CPE' }
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

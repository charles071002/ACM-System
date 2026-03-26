
/**
 * STORAGE SERVICE
 * Centralized utility for handling all persistent data in the ACM system.
 */

import { QrRecord, Professor } from '../types';

export const StorageService = {
  KEYS: {
    SUBMISSIONS: (profId: string) => `acm_submissions_${profId}`,
    HISTORY: (profId: string) => `acm_history_${profId}`,
    QR_RECORDS: (profId: string) => `acm_qr_records_${profId}`,
    PIN: (profId: string) => `acm_pin_${profId}`,
    COMPARTMENT: (profId: string) => `acm_compartment_${profId}`,
    COMPARTMENT_NO: (profId: string) => `acm_compartment_no_${profId}`,
    PROFESSOR_DATA: 'acm_professors_list',
  },

  /** PIN Management */
  getPin: (profId: string, defaultPin: string): string => {
    return localStorage.getItem(StorageService.KEYS.PIN(profId)) || defaultPin;
  },

  setPin: (profId: string, newPin: string) => {
    localStorage.setItem(StorageService.KEYS.PIN(profId), newPin);
  },

  resetPin: (profId: string, defaultPin: string) => {
    localStorage.setItem(StorageService.KEYS.PIN(profId), defaultPin);
  },

  /** Compartment QR Management */
  getCompartmentData: (profId: string, defaultData: string): string => {
    return localStorage.getItem(StorageService.KEYS.COMPARTMENT(profId)) || defaultData;
  },

  setCompartmentData: (profId: string, data: string) => {
    localStorage.setItem(StorageService.KEYS.COMPARTMENT(profId), data);
  },

  /** Compartment Number (Cabinet No) Management */
  getCompartmentNumber: (profId: string, defaultNumber: string): string => {
    return localStorage.getItem(StorageService.KEYS.COMPARTMENT_NO(profId)) || defaultNumber;
  },

  setCompartmentNumber: (profId: string, cabinetNo: string) => {
    localStorage.setItem(StorageService.KEYS.COMPARTMENT_NO(profId), cabinetNo);
  },

  /** Professor Data Management */
  getProfessors: (fallback: Professor[]): Professor[] => {
    const saved = localStorage.getItem(StorageService.KEYS.PROFESSOR_DATA);
    return saved ? JSON.parse(saved) : fallback;
  },

  updateProfessorName: (fallback: Professor[], profId: string, newName: string): Professor[] => {
    const profs = StorageService.getProfessors(fallback);
    const updated = profs.map(p => p.id === profId ? { ...p, name: newName } : p);
    localStorage.setItem(StorageService.KEYS.PROFESSOR_DATA, JSON.stringify(updated));
    return updated;
  },

  /** Submissions Logic */
  getSubmissions: (profId: string): number => {
    const saved = localStorage.getItem(StorageService.KEYS.SUBMISSIONS(profId));
    return saved ? parseInt(saved, 10) : 0;
  },

  setSubmissions: (profId: string, count: number) => {
    localStorage.setItem(StorageService.KEYS.SUBMISSIONS(profId), count.toString());
  },

  /** History Logic */
  getHistory: (profId: string) => {
    const saved = localStorage.getItem(StorageService.KEYS.HISTORY(profId));
    return saved ? JSON.parse(saved) : [];
  },

  saveHistoryRecord: (profId: string, count: number, qrName: string = "Units Cleared") => {
    const history = StorageService.getHistory(profId);
    const newRecord = {
      id: crypto.randomUUID(),
      count,
      qrName,
      clearedAt: new Date().toISOString()
    };
    localStorage.setItem(StorageService.KEYS.HISTORY(profId), JSON.stringify([...history, newRecord]));
    return newRecord;
  },

  clearHistory: (profId: string) => {
    localStorage.setItem(StorageService.KEYS.HISTORY(profId), JSON.stringify([]));
  },

  deleteHistoryItem: (profId: string, itemId: string) => {
    const history = StorageService.getHistory(profId);
    const filtered = history.filter((item: any) => item.id !== itemId);
    localStorage.setItem(StorageService.KEYS.HISTORY(profId), JSON.stringify(filtered));
  },

  /** QR Logic */
  getQrRecords: (profId: string): QrRecord[] => {
    const saved = localStorage.getItem(StorageService.KEYS.QR_RECORDS(profId));
    return saved ? JSON.parse(saved) : [];
  },

  saveQrRecord: (profId: string, name: string, startsAt: string, expiresAt: string) => {
    const records = StorageService.getQrRecords(profId);
    const newRecord: QrRecord = {
      id: crypto.randomUUID(),
      name,
      startsAt,
      expiresAt,
      generatedAt: new Date().toISOString()
    };
    localStorage.setItem(StorageService.KEYS.QR_RECORDS(profId), JSON.stringify([newRecord, ...records]));
    return newRecord;
  },

  updateQrRecord: (profId: string, updatedRecord: QrRecord) => {
    const records = StorageService.getQrRecords(profId);
    const updated = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    localStorage.setItem(StorageService.KEYS.QR_RECORDS(profId), JSON.stringify(updated));
  },

  deleteQrRecord: (profId: string, qrId: string) => {
    const records = StorageService.getQrRecords(profId);
    const filtered = records.filter(r => r.id !== qrId);
    localStorage.setItem(StorageService.KEYS.QR_RECORDS(profId), JSON.stringify(filtered));
  },

  clearQrRecords: (profId: string) => {
    localStorage.removeItem(StorageService.KEYS.QR_RECORDS(profId));
  },

  /**
   * Automatic Expiry Cleanup
   * Removes records where expiresAt is less than the current time.
   * Returns the updated list of valid records.
   */
  cleanupExpiredQrRecords: (profId: string): QrRecord[] => {
    const records = StorageService.getQrRecords(profId);
    const now = new Date();
    const validRecords = records.filter(r => new Date(r.expiresAt) > now);
    
    if (validRecords.length !== records.length) {
      localStorage.setItem(StorageService.KEYS.QR_RECORDS(profId), JSON.stringify(validRecords));
    }
    
    return validRecords;
  }
};

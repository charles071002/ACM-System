import { Professor } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

type ApiProfessor = {
  id: string | number;
  name: string;
  department?: string | null;
};

export const fetchProfessorsFromApi = async (): Promise<Professor[]> => {
  const response = await fetch(`${API_BASE_URL}/api/professors`);
  if (!response.ok) {
    throw new Error(`Failed to load professors: ${response.status}`);
  }

  const payload = await response.json();
  const list: ApiProfessor[] = Array.isArray(payload) ? payload : payload.data;

  if (!Array.isArray(list)) {
    throw new Error('Invalid professor API response shape');
  }

  return list.map((item) => ({
    id: String(item.id),
    name: item.name,
    department: item.department || 'CPE',
  }));
};

export const verifyProfessorPinViaApi = async (professorId: string, pin: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/professors/verify-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: professorId, pin }),
  });

  return response.ok;
};

export const updateProfessorNameViaApi = async (professorId: string, newName: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/professors/${encodeURIComponent(professorId)}/name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newName }),
  });

  return response.ok;
};

export const updateProfessorPinViaApi = async (professorId: string, newPin: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/professors/${encodeURIComponent(professorId)}/pin`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPin }),
  });

  return response.ok;
};

export const devLoginViaApi = async (username: string, password: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/dev/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  return response.ok;
};

export const devChangePasswordViaApi = async (
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/dev/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, currentPassword, newPassword }),
  });

  return response.ok;
};

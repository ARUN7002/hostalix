import {
  Patient,
  Doctor,
  Department,
  Appointment,
  Invoice,
  AuditLog,
  User,
  UserRole,
  AppointmentStatus,
  InvoiceStatus,
  InvoiceItem
} from '../types/hms';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'clinical_core_users',
  ACTIVE_USER_ID: 'clinical_core_active_user_id',
  DEPARTMENTS: 'clinical_core_departments',
  DOCTORS: 'clinical_core_doctors',
  PATIENTS: 'clinical_core_patients',
  APPOINTMENTS: 'clinical_core_appointments',
  INVOICES: 'clinical_core_invoices',
  AUDIT_LOGS: 'clinical_core_audit_logs',
};

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
};

export const getActiveUser = (): User => {
  const users = getStoredUsers();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
  if (activeId) {
    const found = users.find(u => u.id === Number(activeId));
    if (found) return found;
  }
  return users[0]; // Default to Admin
};

export const setActiveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, String(user.id));
};

export const getStoredDepartments = (): Department[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    return INITIAL_DEPARTMENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DEPARTMENTS;
  }
};

export const getStoredDoctors = (): Doctor[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
    return INITIAL_DOCTORS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DOCTORS;
  }
};

export const getStoredPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    return INITIAL_PATIENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PATIENTS;
  }
};

export const saveStoredPatients = (patients: Patient[]): void => {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const getStoredAppointments = (): Appointment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    return INITIAL_APPOINTMENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveStoredAppointments = (appointments: Appointment[]): void => {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

export const getStoredInvoices = (): Invoice[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
    return INITIAL_INVOICES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
};

export const getStoredAuditLogs = (): AuditLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const addAuditLog = (
  actor: User,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
  status: 'SUCCESS' | 'BLOCKED_SECURITY' | 'VALIDATION_FAILED' = 'SUCCESS'
): void => {
  const currentLogs = getStoredAuditLogs();
  const newLog: AuditLog = {
    id: 'aud-' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    actorUsername: actor.username,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    details,
    status,
  };
  const updated = [newLog, ...currentLogs.slice(0, 99)];
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
};

export const resetAllDemoData = (): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, String(INITIAL_USERS[0].id));
};

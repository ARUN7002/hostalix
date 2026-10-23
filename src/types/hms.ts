/**
 * Core Domain Types for Hospital Management System
 * Mirrors the Java 21 / Spring Boot 3.3.4 JPA Entities and DTOs
 */

export type UserRole = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_NURSE' | 'ROLE_RECEPTIONIST' | 'ROLE_CASHIER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: number;
  avatarUrl?: string;
  enabled: boolean;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type TriageLevel = 'IMMEDIATE' | 'VERY_URGENT' | 'URGENT' | 'STANDARD' | 'NON_URGENT';

export interface Patient {
  id: number;
  mrn: string; // Medical Record Number e.g. "MRN-2026-0041"
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: BloodGroup;
  phoneNumber: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  address: string;
  allergies: string[];
  chronicConditions: string[];
  triageLevel: TriageLevel;
  registeredDate: string;
  assignedWard?: string;
  bedNumber?: string;
}

export interface Department {
  id: number;
  code: string; // e.g. "CARD", "ORTH", "NEUR"
  name: string;
  description: string;
  headDoctorName: string;
  totalBeds: number;
  occupiedBeds: number;
  active: boolean;
}

export interface Doctor {
  id: number;
  employeeCode: string; // e.g. "DOC-701"
  firstName: string;
  lastName: string;
  chineseName?: string; // e.g. "万斯医生" (Dr. Vance)
  email: string;
  phoneNumber: string;
  departmentId: number;
  specialization: string;
  qualification: string; // e.g. "MD, FACC, Board Certified"
  consultationFee: number; // in USD base
  roomNumber: string;
  availableDays: string[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI']
  timeSlots: string[]; // ['09:00', '09:30', '10:00', ...]
  active: boolean;
}

export type AppointmentStatus = 'SCHEDULED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface PrescriptionItem {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Appointment {
  id: number;
  appointmentCode: string; // e.g. "APT-2026-108"
  patientId: number;
  doctorId: number;
  departmentId: number;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // "09:30"
  status: AppointmentStatus;
  chiefComplaint: string;
  triageNotes?: string;
  diagnosis?: string;
  prescriptions?: PrescriptionItem[];
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    spO2: number;
  };
  invoiceGenerated: boolean;
  createdAt: string;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type ItemType = 'CONSULTATION' | 'LAB_TEST' | 'PHARMACY' | 'PROCEDURE' | 'ROOM_CHARGE';

export interface InvoiceItem {
  id: string;
  description: string;
  itemType: ItemType;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string; // e.g. "INV-2026-089"
  patientId: number;
  appointmentId?: number;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.05 (5%)
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  paymentCurrency?: 'USD' | 'CNY';
  paymentMethod?: string;
  paidAt?: string;
  transactionReference?: string;
  receiptNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorUsername: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  status: 'SUCCESS' | 'BLOCKED_SECURITY' | 'VALIDATION_FAILED';
}

export interface UnitTestResult {
  id: string;
  testClass: string;
  testMethod: string;
  description: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  assertion: string;
}

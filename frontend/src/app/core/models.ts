export type Role = 'DOCTOR' | 'STAFF' | 'PATIENT';
export type AppointmentMode = 'OFFLINE' | 'ONLINE';
export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface AuthSession { accessToken: string; tokenType: 'Bearer'; expiresInSeconds: number; role: Role; email: string; admin: boolean; }
export interface DoctorAccount { id: string; email: string; enabled: boolean; admin: boolean; }
export interface Patient {
  id: string; firstName: string; lastName: string; dateOfBirth?: string; gender?: string; phone?: string; email?: string;
  address?: string; emergencyContactName?: string; emergencyContactPhone?: string; medicalHistory?: string;
  chiefComplaints?: string; complaintDuration?: string; physicalGenerals?: string; mentalGenerals?: string;
  appetite?: string; thirst?: string; cravings?: string; aversions?: string; thermalReaction?: string; perspiration?: string;
  sleep?: string; dreams?: string; disposition?: string; fears?: string; anxiety?: string; emotionalState?: string;
  modalities?: string; aggravations?: string; ameliorations?: string; pastHistory?: string; familyHistory?: string;
}
export interface Appointment {
  id: string; patientId: string; patientName: string; startsAt: string; endsAt: string; mode: AppointmentMode;
  status: AppointmentStatus; videoLink?: string; reason?: string;
}
export interface AppointmentInput { patientId: string; startsAt: string; endsAt: string; mode: AppointmentMode; videoLink?: string; reason?: string; }
export interface DashboardConsultation { id: string; appointmentId?: string; patientId: string; patientName: string; reason?: string; mode: AppointmentMode | 'WALK_IN'; startedAt: string; status: 'IN_PROGRESS' | 'COMPLETED'; }
export interface DashboardStats { patientsToday: number; pendingOnlineConsultations: number; revenueToday: number; completedConsultationsToday: number; consultationsInProgress: DashboardConsultation[]; }
export interface Invoice { id: string; invoiceNumber: string; patientId: string; appointmentId: string; amount: number; currencyCode: string; paymentStatus: string; issuedAt: string; }
export interface Consultation { id: string; appointmentId?: string; patientId: string; patientName: string; mode: AppointmentMode | 'WALK_IN'; runningNotes?: string; heringCureNotes?: string; followUpAt?: string; startedAt: string; endedAt?: string; status: 'IN_PROGRESS' | 'COMPLETED'; }
export interface Prescription { id: string; consultationId: string; prescribedAt: string; dietaryRestrictions?: string; items: Array<{ remedyId: string; remedyName: string; potency: string; dosage: string; repetition: string; duration?: string }>; }
export interface Remedy { id: string; name: string; potency: string; form?: string; quantityOnHand: number; reorderLevel: number; unitPrice?: number; }
export interface PrescriptionItemInput { remedyId: string; dosage: string; repetition: string; duration?: string; }
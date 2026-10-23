import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, AppointmentInput, Consultation, DashboardStats, DoctorAccount, Invoice, Patient, Prescription, PrescriptionItemInput, Remedy } from './models';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ClinicApiService {
  private readonly http = inject(HttpClient);
  patients(query = ''): Observable<Patient[]> {
    return this.http.get<Patient[]>(apiUrl('/api/v1/patients'), { params: new HttpParams().set('q', query) });
  }
  patient(id: string): Observable<Patient> { return this.http.get<Patient>(apiUrl(`/api/v1/patients/${id}`)); }
  myProfile(): Observable<Patient> { return this.http.get<Patient>(apiUrl('/api/v1/patients/me')); }
  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.http.post<Patient>(apiUrl('/api/v1/patients'), patient);
  }
  appointments(from: string, to: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(apiUrl('/api/v1/appointments'), { params: { from, to } });
  }
  bookAppointment(appointment: AppointmentInput): Observable<Appointment> {
    return this.http.post<Appointment>(apiUrl('/api/v1/appointments'), appointment);
  }
  startConsultation(appointmentId: string): Observable<Consultation> {
    return this.http.post<Consultation>(apiUrl(`/api/v1/appointments/${appointmentId}/consultations`), {});
  }
  startDirectConsultation(patientId: string): Observable<Consultation> {
    return this.http.post<Consultation>(apiUrl('/api/v1/consultations'), { patientId });
  }
  saveConsultationNotes(id: string, runningNotes: string, heringCureNotes: string, followUpAt?: string): Observable<Consultation> {
    return this.http.put<Consultation>(apiUrl(`/api/v1/consultations/${id}/notes`), { runningNotes, heringCureNotes, followUpAt });
  }
  closeConsultation(id: string): Observable<Consultation> {
    return this.http.post<Consultation>(apiUrl(`/api/v1/consultations/${id}/close`), {});
  }
  patientPrescriptions(patientId: string): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(apiUrl(`/api/v1/patients/${patientId}/prescriptions`));
  }
  prescribe(consultationId: string, dietaryRestrictions: string, items: PrescriptionItemInput[]): Observable<Prescription> {
    return this.http.post<Prescription>(apiUrl(`/api/v1/consultations/${consultationId}/prescriptions`), { dietaryRestrictions, items });
  }
  remedies(): Observable<Remedy[]> { return this.http.get<Remedy[]>(apiUrl('/api/v1/remedies')); }
  createRemedy(remedy: Omit<Remedy, 'id'>): Observable<Remedy> { return this.http.post<Remedy>(apiUrl('/api/v1/remedies'), remedy); }
  dashboardStats(): Observable<DashboardStats> { return this.http.get<DashboardStats>(apiUrl('/api/v1/dashboard')); }
  issueInvoice(appointmentId: string, amount: number, currencyCode: string): Observable<Invoice> {
    return this.http.post<Invoice>(apiUrl(`/api/v1/invoices/appointments/${appointmentId}`), { amount, currencyCode });
  }
  doctors(): Observable<DoctorAccount[]> { return this.http.get<DoctorAccount[]>(apiUrl('/api/v1/doctors')); }
  createDoctor(email: string, initialPassword: string): Observable<DoctorAccount> {
    return this.http.post<DoctorAccount>(apiUrl('/api/v1/doctors'), { email, initialPassword });
  }
}
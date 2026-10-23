import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClinicApiService } from '../core/clinic-api.service';
import { Appointment, Consultation, Patient, Prescription, Remedy } from '../core/models';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-consultation', imports: [DatePipe, ReactiveFormsModule, RouterLink], template: `
  <section class="page-heading"><div><p class="eyebrow">CONSULTATION ROOM</p><h1>{{ activeConsultation() ? 'Consultation' : 'Start a consultation' }}</h1><p class="subheading">{{ patient() ? patient()?.firstName + ' ' + patient()?.lastName : 'Open a scheduled appointment or start directly from a patient record.' }}</p></div>@if (activeConsultation(); as consultation) { <div class="consult-heading-actions"><span class="mode-tag" [class.online-tag]="consultation.mode === 'ONLINE'" [class.clinic-tag]="consultation.mode !== 'ONLINE'">{{ consultation.mode === 'ONLINE' ? 'ONLINE VISIT' : consultation.mode === 'WALK_IN' ? 'WALK-IN VISIT' : 'IN-CLINIC VISIT' }}</span><span class="status-pill" [class.status-done]="consultation.status === 'COMPLETED'">{{ consultation.status === 'IN_PROGRESS' ? 'In progress' : 'Completed' }}</span>@if (consultation.status === 'IN_PROGRESS') { <button class="primary-btn close-consultation" type="button" (click)="closeConsultation()" [disabled]="closing()">{{ closing() ? 'Closing…' : 'Close consultation' }}</button> }</div> }</section>
  @if (error()) { <div class="error-banner" role="alert">{{ error() }}</div> }
  @if (!activeConsultation()) {
    <section class="direct-start-panel"><div><p class="eyebrow">WALK-IN / UNSCHEDULED</p><h2>Start directly from a patient</h2><p class="subheading">No appointment needed. The visit will be saved in the patient’s consultation history.</p></div><button class="primary-btn" type="button" (click)="showPatientPicker.update((shown) => !shown)">{{ showPatientPicker() ? 'Hide patients' : 'Choose patient' }} <span>→</span></button></section>
    @if (showPatientPicker()) { <section class="direct-patient-list">@for (person of patients(); track person.id) { <article class="appointment-row"><span class="patient-initial">{{ person.firstName[0] }}{{ person.lastName[0] }}</span><div class="appt-main"><strong>{{ person.firstName }} {{ person.lastName }}</strong><p>{{ person.chiefComplaints || 'No chief complaint recorded' }} · {{ person.phone || person.email || 'No contact details' }}</p></div><button class="primary-btn" type="button" (click)="openDirect(person)" [disabled]="opening()">{{ opening() ? 'Opening…' : 'Start walk-in →' }}</button></article> } @empty { <div class="empty-state">{{ patientsLoading() ? 'Loading patients…' : 'No patients found. Create a patient record first.' }}</div> }</section> }
    <p class="eyebrow scheduled-label">SCHEDULED APPOINTMENTS</p>
    <div class="appointment-page-list">@for (appointment of appointments(); track appointment.id) { <article class="appointment-row"><time>{{ appointment.startsAt | date:'h:mm' }}<small>{{ appointment.startsAt | date:'a' }}</small></time><span class="timeline-dot"></span><div class="appt-main"><strong>{{ appointment.patientName }}</strong><p>{{ appointment.reason || 'Consultation' }}</p></div><span class="mode-tag" [class.online-tag]="appointment.mode === 'ONLINE'" [class.clinic-tag]="appointment.mode === 'OFFLINE'">{{ appointment.mode === 'ONLINE' ? 'ONLINE' : 'IN CLINIC' }}</span><button class="primary-btn" type="button" (click)="open(appointment)" [disabled]="opening()">{{ opening() ? 'Opening…' : 'Open visit →' }}</button></article> } @empty { <div class="empty-state">{{ loading() ? 'Loading today’s appointments…' : 'No appointments scheduled today.' }}</div> }</div>
  } @else {
    <div class="consult-grid"><div class="consult-main"><section class="consult-patient"><div class="patient-initial large-initial">{{ initials() }}</div><div><strong>{{ patient()?.firstName }} {{ patient()?.lastName }}</strong><p>@if (activeAppointment()) { Visit at {{ activeAppointment()?.startsAt | date:'h:mm a' }} } @else { Walk-in · Started {{ activeConsultation()?.startedAt | date:'h:mm a' }} } · {{ patient()?.phone || 'No phone recorded' }}</p></div><a class="outline-btn" routerLink="/patients">Patient records ↗</a></section>
      <section class="history-strip"><p class="eyebrow">CASE HISTORY</p><div class="history-details"><strong>{{ patient()?.chiefComplaints || activeAppointment()?.reason || 'No chief complaint recorded' }}</strong><span>{{ patient()?.complaintDuration || 'Duration not recorded' }}</span><span class="quiet">{{ patient()?.modalities || 'Modalities not recorded' }}</span></div><p class="hering-note"><b>Patient history</b> · {{ patient()?.medicalHistory || 'No additional medical history recorded.' }}</p></section>
      <section class="history-strip prescription-history"><p class="eyebrow">PREVIOUS PRESCRIPTIONS</p>@for (prescription of history(); track prescription.id) { <div class="history-details previous-rx"><strong>{{ prescription.items[0]?.remedyName }} {{ prescription.items[0]?.potency }}</strong><span>{{ prescription.prescribedAt | date:'mediumDate' }}</span><span>{{ prescription.items[0]?.dosage }} · {{ prescription.items[0]?.repetition }}</span>@if (prescription.dietaryRestrictions) { <span class="quiet">Diet: {{ prescription.dietaryRestrictions }}</span> }</div> } @empty { <span class="quiet">No prior prescriptions recorded.</span> }</section>
      <section class="note-section"><div class="section-head"><div><p class="eyebrow">TODAY'S VISIT</p><h2>Running notes</h2></div><span class="autosave">{{ savedNotes() ? 'Saved' : 'Draft' }}</span></div><textarea rows="6" [formControl]="notes" [disabled]="activeConsultation()?.status === 'COMPLETED'" placeholder="Record observations, changes since last visit, and the patient's words…"></textarea><label class="diet-label hering-input">Hering's observation <textarea rows="2" [formControl]="heringNotes" [disabled]="activeConsultation()?.status === 'COMPLETED'" placeholder="Track direction and pace of change at follow-up…"></textarea></label><button class="outline-btn save-notes" type="button" (click)="saveNotes()" [disabled]="savingNotes() || activeConsultation()?.status === 'COMPLETED'">{{ savingNotes() ? 'Saving…' : 'Save visit notes' }}</button></section>
      <section class="prescribe-section"><div class="section-head"><div><p class="eyebrow">PRESCRIPTION</p><h2>Remedy plan</h2></div><button class="text-button" type="button" (click)="addRemedy()" [disabled]="activeConsultation()?.status === 'COMPLETED'">＋ Add remedy</button></div><div [formGroup]="form"><div formArrayName="remedies">@for (item of remedies.controls; track $index) { <div class="remedy-line" [formGroupName]="$index"><label>Remedy & potency<select formControlName="remedyId" [disabled]="activeConsultation()?.status === 'COMPLETED'"><option value="">Choose remedy</option>@for (remedy of remedyList(); track remedy.id) { <option [value]="remedy.id">{{ remedy.name }} {{ remedy.potency }}</option> }</select></label><label>Dosage<input formControlName="dosage" [disabled]="activeConsultation()?.status === 'COMPLETED'" placeholder="4 pills"></label><label>Repetition<input formControlName="repetition" [disabled]="activeConsultation()?.status === 'COMPLETED'" placeholder="Once daily"></label><button type="button" class="icon-action remove-action" aria-label="Remove remedy" title="Remove remedy" (click)="removeRemedy($index)" [disabled]="activeConsultation()?.status === 'COMPLETED'">×</button></div> }</div></div><label class="diet-label">Dietary restrictions <input [formControl]="dietary" [disabled]="activeConsultation()?.status === 'COMPLETED'" placeholder="e.g. Avoid coffee, raw onion and garlic"></label><button class="primary-btn prescribe-button" type="button" (click)="savePrescription()" [disabled]="prescribing() || activeConsultation()?.status === 'COMPLETED'">{{ prescribing() ? 'Saving prescription…' : 'Save prescription' }} <span>→</span></button></section>
    </div><aside class="consult-aside"><div class="call-panel"><div class="call-header"><span>VIDEO VISIT</span><span class="recording-dot"></span></div><div class="video-placeholder"><div class="video-avatar">{{ initials() }}</div><span>Teleconsultation</span><small>{{ activeAppointment()?.mode === 'ONLINE' ? 'Use the secure clinic video link' : 'This visit is in clinic' }}</small></div>@if (activeAppointment()?.videoLink) { <a class="call-connect video-link" [href]="activeAppointment()?.videoLink" target="_blank" rel="noopener noreferrer">Open video link ↗</a> } @else { <p class="call-note">No video integration is configured for this visit.</p> }</div><div class="vitals-panel"><p class="eyebrow">PHYSICAL GENERALS</p><h3>Case at a glance</h3><div class="vital-row"><span>Physical generals</span><b>{{ patient()?.physicalGenerals || 'Not recorded' }}</b></div><div class="vital-row"><span>Mental generals</span><b>{{ patient()?.mentalGenerals || 'Not recorded' }}</b></div><div class="vital-row"><span>Past history</span><b>{{ patient()?.pastHistory || 'Not recorded' }}</b></div><div class="vital-row"><span>Family history</span><b>{{ patient()?.familyHistory || 'Not recorded' }}</b></div></div></aside></div>
  }
` })
export class ConsultationComponent {
  private readonly api = inject(ClinicApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly feedback = inject(FeedbackService);
  readonly appointments = signal<Appointment[]>([]);
  readonly patients = signal<Patient[]>([]);
  readonly patientsLoading = signal(true);
  readonly showPatientPicker = signal(false);
  readonly activeAppointment = signal<Appointment | null>(null);
  readonly activeConsultation = signal<Consultation | null>(null);
  readonly patient = signal<Patient | null>(null);
  readonly history = signal<Prescription[]>([]);
  readonly remedyList = signal<Remedy[]>([]);
  readonly loading = signal(true);
  readonly opening = signal(false);
  readonly savingNotes = signal(false);
  readonly prescribing = signal(false);
  readonly closing = signal(false);
  readonly savedNotes = signal(false);
  readonly error = signal('');
  readonly notes = this.fb.nonNullable.control('');
  readonly heringNotes = this.fb.nonNullable.control('');
  readonly dietary = this.fb.nonNullable.control('');
  readonly remedies: FormArray = this.fb.array([this.remedyGroup()]);
  readonly form = this.fb.group({ remedies: this.remedies });

  constructor() {
    this.api.remedies().subscribe({ next: (items) => this.remedyList.set(items) });
    this.api.patients().subscribe({ next: (items) => { this.patients.set(items); this.patientsLoading.set(false); }, error: () => this.patientsLoading.set(false) });
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 1);
    this.api.appointments(from.toISOString(), to.toISOString()).subscribe({
      next: (items) => {
        this.appointments.set(items); this.loading.set(false);
        const selectedId = this.route.snapshot.queryParamMap.get('appointmentId');
        const selected = items.find((item) => item.id === selectedId);
        if (selected) this.open(selected);
        const patientId = this.route.snapshot.queryParamMap.get('patientId');
        if (patientId) this.api.patient(patientId).subscribe({ next: (person) => this.openDirect(person) });
      }, error: () => this.loading.set(false),
    });
  }

  openDirect(person: Patient): void {
    this.opening.set(true); this.error.set('');
    forkJoin({ consultation: this.api.startDirectConsultation(person.id), history: this.api.patientPrescriptions(person.id) }).subscribe({
      next: ({ consultation, history }) => {
        this.activeAppointment.set(null);
        this.activeConsultation.set(consultation);
        this.patient.set(person);
        this.history.set(history);
        this.notes.setValue(consultation.runningNotes ?? '');
        this.heringNotes.setValue(consultation.heringCureNotes ?? '');
        this.opening.set(false);
        this.feedback.success('Walk-in consultation started.');
      },
      error: () => {
        this.opening.set(false);
        this.error.set('Could not start a walk-in consultation.');
        this.feedback.error('Could not start the consultation. Check the patient record and try again.');
      },
    });
  }

  initials(): string { const person = this.patient(); return person ? `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase() : 'PT'; }
  private remedyGroup() { return this.fb.nonNullable.group({ remedyId: ['', Validators.required], dosage: ['', Validators.required], repetition: ['', Validators.required] }); }
  addRemedy(): void { this.remedies.push(this.remedyGroup()); this.feedback.info('Remedy line added.'); }
  removeRemedy(index: number): void {
    if (this.remedies.length > 1) { this.remedies.removeAt(index); this.feedback.info('Remedy line removed.'); }
    else this.feedback.info('A prescription needs at least one remedy line.');
  }
  prescriptionReady(): boolean { return this.remedies.length > 0 && this.remedies.valid; }

  open(appointment: Appointment): void {
    this.opening.set(true); this.error.set('');
    forkJoin({ consultation: this.api.startConsultation(appointment.id), patient: this.api.patient(appointment.patientId), history: this.api.patientPrescriptions(appointment.patientId) }).subscribe({
      next: ({ consultation, patient, history }) => {
        this.activeAppointment.set(appointment); this.activeConsultation.set(consultation); this.patient.set(patient); this.history.set(history);
        this.notes.setValue(consultation.runningNotes ?? ''); this.heringNotes.setValue(consultation.heringCureNotes ?? ''); this.opening.set(false);
        this.feedback.success(consultation.status === 'COMPLETED' ? 'Completed consultation loaded read-only.' : 'Consultation opened.');
      },
      error: (error: { status?: number }) => {
        this.opening.set(false);
        this.error.set(error.status === 409 ? 'A consultation is already open for this visit. Load its notes from the patient history.' : 'Could not open this consultation. Check access and try again.');
        this.feedback.error(error.status === 409 ? 'This visit already has a consultation. Resume it from the dashboard.' : 'Could not open this consultation. Check access and try again.');
      },
    });
  }

  saveNotes(): void {
    const consultation = this.activeConsultation(); if (!consultation) return;
    this.savingNotes.set(true); this.error.set('');
    this.api.saveConsultationNotes(consultation.id, this.notes.value, this.heringNotes.value).subscribe({
      next: (updated) => { this.activeConsultation.set(updated); this.savedNotes.set(true); this.savingNotes.set(false); this.feedback.success('Consultation notes saved.'); },
      error: () => { this.savingNotes.set(false); this.error.set('Could not save consultation notes.'); this.feedback.error('Could not save consultation notes.'); },
    });
  }

  savePrescription(): void {
    const consultation = this.activeConsultation(); if (!consultation) { this.feedback.error('Open a visit before saving a prescription.'); return; }
    if (!this.prescriptionReady()) {
      this.remedies.markAllAsTouched();
      this.feedback.error('Complete each remedy, dosage, and repetition field before saving the prescription.');
      return;
    }
    this.prescribing.set(true); this.error.set('');
    const items = this.remedies.getRawValue() as Array<{ remedyId: string; dosage: string; repetition: string }>;
    this.api.prescribe(consultation.id, this.dietary.value, items).subscribe({
      next: (prescription) => { this.history.update((history) => [prescription, ...history]); this.prescribing.set(false); this.feedback.success('Prescription saved successfully.'); },
      error: () => { this.prescribing.set(false); this.error.set('Could not save this prescription. Check that each remedy is active and try again.'); this.feedback.error('Could not save this prescription. Check each remedy and try again.'); },
    });
  }

  closeConsultation(): void {
    const consultation = this.activeConsultation();
    if (!consultation || consultation.status === 'COMPLETED') return;
    this.closing.set(true); this.error.set('');
    this.api.closeConsultation(consultation.id).subscribe({
      next: (closed) => { this.activeConsultation.set(closed); this.closing.set(false); this.feedback.success('Consultation closed and marked completed.'); },
      error: () => { this.closing.set(false); this.error.set('Could not close this consultation. Please try again.'); this.feedback.error('Could not close this consultation. Please try again.'); },
    });
  }
}

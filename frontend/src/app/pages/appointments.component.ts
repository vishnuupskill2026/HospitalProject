import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClinicApiService } from '../core/clinic-api.service';
import { Appointment, Patient } from '../core/models';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-appointments', imports: [DatePipe, ReactiveFormsModule, RouterLink], template: `
  <section class="page-heading"><div><p class="eyebrow">SCHEDULE</p><h1>Appointments</h1><p class="subheading">A single view of in-clinic visits and teleconsults.</p></div><button class="primary-btn" type="button" (click)="toggleBooking()">＋ <span>{{ showBooking() ? 'Close booking' : 'Book appointment' }}</span></button></section>
  @if (bookingError()) { <div class="error-banner" role="alert">{{ bookingError() }}</div> }
  @if (showBooking()) { <form class="booking-form" [formGroup]="form" (ngSubmit)="book()"><div class="form-grid">
    <label>Patient<select formControlName="patientId"><option value="">Select a patient</option>@for (patient of patients(); track patient.id) { <option [value]="patient.id">{{ patient.firstName }} {{ patient.lastName }}</option> }</select></label>
    <label>Visit mode<select formControlName="mode"><option value="OFFLINE">In clinic</option><option value="ONLINE">Online</option></select></label>
    <label>Starts at<input type="datetime-local" formControlName="startsAt"></label><label>Ends at<input type="datetime-local" formControlName="endsAt"></label>
    @if (form.controls.mode.value === 'ONLINE') { <label class="span-two">Video consultation link<input type="url" formControlName="videoLink" placeholder="https://…" required></label> }
    <label class="span-two">Reason for visit<input formControlName="reason" placeholder="Optional consultation reason"></label>
  </div><div class="booking-actions"><span>Time conflicts are checked by the clinic API.</span><button class="primary-btn" type="submit" [disabled]="booking()">{{ booking() ? 'Booking…' : 'Confirm appointment' }} <span>→</span></button></div></form> }
  <div class="schedule-filter"><button type="button" [class.selected]="range() === 'TODAY'" (click)="selectRange('TODAY')">Today</button><button type="button" [class.selected]="range() === 'WEEK'" (click)="selectRange('WEEK')">This week</button><div class="filter-spacer"></div><span class="mode-tag clinic-tag">IN CLINIC</span><span class="mode-tag online-tag">ONLINE</span></div>
  <div class="appointment-page-list">@for (appointment of appointments(); track appointment.id) { <article class="appointment-row"><time>{{ appointment.startsAt | date:'h:mm' }}<small>{{ appointment.startsAt | date:'a' }}</small></time><span class="timeline-dot"></span><div class="appt-main"><strong>{{ appointment.patientName }}</strong><p>{{ appointment.reason || 'Consultation' }}</p></div><span class="mode-tag" [class.online-tag]="appointment.mode === 'ONLINE'" [class.clinic-tag]="appointment.mode === 'OFFLINE'">{{ appointment.mode === 'ONLINE' ? 'ONLINE' : 'IN CLINIC' }}</span><span class="appt-status upcoming">{{ appointment.status }}</span><a class="row-action" [routerLink]="['/consultation']" [queryParams]="{ appointmentId: appointment.id }">Open →</a><button class="row-action invoice-action" type="button" (click)="openInvoice(appointment)">Invoice</button>@if (appointment.videoLink) { <a class="row-action" [href]="appointment.videoLink" target="_blank" rel="noopener noreferrer">Join ↗</a> }</article> } @empty { <div class="empty-state">{{ loading() ? 'Loading schedule…' : 'No appointments in this date range.' }}</div> }</div>
  @if (invoiceAppointment(); as appointment) { <div class="invoice-overlay"><section class="invoice-dialog" role="dialog" aria-modal="true" aria-labelledby="invoice-title"><button class="icon-action close-dialog" aria-label="Close invoice form" (click)="closeInvoice()">×</button><p class="eyebrow">VISIT BILLING</p><h2 id="invoice-title">Create invoice</h2><p class="subheading">{{ appointment.patientName }} · {{ appointment.startsAt | date:'medium' }}</p>@if (invoiceError()) { <p class="form-error" role="alert">{{ invoiceError() }}</p> }@if (issuedInvoice(); as invoice) { <div class="success-banner">{{ invoice.invoiceNumber }} issued · {{ invoice.currencyCode }} {{ invoice.amount }} · {{ invoice.paymentStatus }}</div> } @else { <form [formGroup]="invoiceForm" (ngSubmit)="issueInvoice()"><label class="invoice-field">Amount<input type="number" min="0.01" step="0.01" formControlName="amount"></label><label class="invoice-field">Currency<select formControlName="currencyCode"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></label><button class="primary-btn" type="submit" [disabled]="issuingInvoice()">{{ issuingInvoice() ? 'Issuing…' : 'Issue invoice' }} <span>→</span></button></form> }</section></div> }
` })
export class AppointmentsComponent {
  private readonly api = inject(ClinicApiService);
  private readonly fb = inject(FormBuilder);
  private readonly feedback = inject(FeedbackService);
  readonly appointments = signal<Appointment[]>([]);
  readonly range = signal<'TODAY' | 'WEEK'>('TODAY');
  readonly patients = signal<Patient[]>([]);
  readonly loading = signal(true);
  readonly showBooking = signal(false);
  readonly booking = signal(false);
  readonly bookingError = signal('');
  readonly invoiceAppointment = signal<Appointment | null>(null);
  readonly issuedInvoice = signal<import('../core/models').Invoice | null>(null);
  readonly issuingInvoice = signal(false);
  readonly invoiceError = signal('');
  readonly invoiceForm = this.fb.nonNullable.group({ amount: [0, [Validators.required, Validators.min(0.01)]], currencyCode: ['INR', Validators.required] });
  readonly form = this.fb.nonNullable.group({
    patientId: ['', Validators.required], mode: ['OFFLINE' as 'ONLINE' | 'OFFLINE', Validators.required],
    startsAt: ['', Validators.required], endsAt: ['', Validators.required], videoLink: [''], reason: [''],
  });
  constructor() {
    this.api.patients().subscribe({ next: (patients) => this.patients.set(patients) });
    this.refreshAppointments();
  }
  selectRange(range: 'TODAY' | 'WEEK'): void {
    this.range.set(range);
    this.loading.set(true);
    this.refreshAppointments();
    this.feedback.info(range === 'TODAY' ? "Showing today's appointments." : "Showing this week's appointments.");
  }
  private refreshAppointments(): void {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    if (this.range() === 'WEEK') from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    const to = new Date(from); to.setDate(to.getDate() + (this.range() === 'WEEK' ? 7 : 1));
    this.api.appointments(from.toISOString(), to.toISOString()).subscribe({
      next: (items) => { this.appointments.set(items); this.loading.set(false); },
      error: () => { this.loading.set(false); this.feedback.error('Could not load appointments. Check your connection.'); },
    });
  }
  openInvoice(appointment: Appointment): void {
    this.invoiceAppointment.set(appointment); this.issuedInvoice.set(null); this.invoiceError.set('');
    this.invoiceForm.reset({ amount: 0, currencyCode: 'INR' });
    this.feedback.info(`Invoice form opened for ${appointment.patientName}.`);
  }
  toggleBooking(): void {
    const opening = !this.showBooking();
    this.showBooking.set(opening);
    this.feedback.info(opening ? 'Appointment booking form opened.' : 'Appointment booking form closed.');
  }
  book(): void {
    const values = this.form.getRawValue();
    if (this.form.invalid) {
      this.feedback.invalidForm(this.form, { patientId: 'Patient', mode: 'Visit mode', startsAt: 'Start time', endsAt: 'End time' });
      this.bookingError.set('Complete the required booking fields.');
      return;
    }
    const startTime = new Date(values.startsAt);
    const endTime = new Date(values.endsAt);
    if (!(endTime > startTime) || endTime.getTime() - startTime.getTime() > 4 * 60 * 60 * 1000) {
      this.bookingError.set('The end time must be after the start time and the visit must not exceed four hours.');
      this.feedback.error('Check appointment times: end must be after start and duration must be four hours or less.');
      return;
    }
    if (startTime.getTime() < Date.now() - 5 * 60 * 1000) {
      this.bookingError.set('Appointments cannot be scheduled in the past.');
      this.feedback.error('Choose a future appointment time.');
      return;
    }
    if (values.mode === 'ONLINE' && !/^https:\/\//i.test(values.videoLink.trim())) {
      this.bookingError.set('Online appointments need a secure HTTPS video link.');
      this.feedback.error('Enter a valid secure HTTPS video link for the online consultation.');
      return;
    }
    this.booking.set(true); this.bookingError.set('');
    this.api.bookAppointment({ ...values, startsAt: new Date(values.startsAt).toISOString(), endsAt: new Date(values.endsAt).toISOString() }).subscribe({
      next: () => {
        this.booking.set(false); this.showBooking.set(false); this.form.reset({ patientId: '', mode: 'OFFLINE', startsAt: '', endsAt: '', videoLink: '', reason: '' });
        this.feedback.success('Appointment booked successfully.');
        this.refreshAppointments();
      },
      error: (error: { status?: number }) => {
        this.booking.set(false);
        this.bookingError.set(error.status === 409 ? 'That time is already booked. Choose another slot.' : 'Could not book the appointment. Check the details and try again.');
        this.feedback.error(error.status === 409 ? 'That appointment time is already booked. Choose another slot.' : 'Could not book the appointment. Please check the details.');
      },
    });
  }
  issueInvoice(): void {
    const appointment = this.invoiceAppointment();
    if (!appointment) return;
    if (this.invoiceForm.invalid) {
      this.feedback.invalidForm(this.invoiceForm, { amount: 'Amount (greater than zero)', currencyCode: 'Currency' });
      return;
    }
    this.issuingInvoice.set(true); this.invoiceError.set('');
    const value = this.invoiceForm.getRawValue();
    this.api.issueInvoice(appointment.id, value.amount, value.currencyCode).subscribe({
      next: (invoice) => { this.issuedInvoice.set(invoice); this.issuingInvoice.set(false); this.feedback.success(`Invoice ${invoice.invoiceNumber} issued successfully.`); },
      error: (error: { status?: number }) => { this.invoiceError.set(error.status === 409 ? 'An invoice already exists for this visit.' : 'Invoice could not be issued. Check the amount and try again.'); this.issuingInvoice.set(false); this.feedback.error(error.status === 409 ? 'This appointment already has an invoice.' : 'Invoice could not be issued. Check the amount and try again.'); },
    });
  }
  closeInvoice(): void { this.invoiceAppointment.set(null); this.issuedInvoice.set(null); this.invoiceError.set(''); this.feedback.info('Invoice form closed.'); }
}
import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClinicApiService } from '../core/clinic-api.service';
import { Appointment, DashboardConsultation, DashboardStats } from '../core/models';
import { AuthService } from '../core/auth.service';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-dashboard', imports: [DatePipe, RouterLink], template: `
  <section class="page-heading"><div><p class="eyebrow">{{ todayLabel }} · CLINIC OVERVIEW</p><h1>Good morning, Doctor <span>✳</span></h1><p class="subheading">A clear view of today's care and follow-ups.</p></div><a class="primary-btn" routerLink="/patients/new">＋ <span>New patient</span></a></section>
  <section class="stat-row" aria-label="Clinic statistics"><article class="stat"><div class="stat-label">APPOINTMENTS TODAY <span class="stat-symbol">◎</span></div><strong>{{ stats()?.patientsToday ?? '—' }}</strong><small>Scheduled visits</small></article><article class="stat"><div class="stat-label">ONLINE PENDING <span class="stat-symbol">↗</span></div><strong>{{ stats()?.pendingOnlineConsultations ?? '—' }}</strong><small>Awaiting consultation</small></article><article class="stat"><div class="stat-label">INVOICED TODAY <span class="stat-symbol">₹</span></div><strong>{{ revenueLabel() }}</strong><small>Issued invoices</small></article><article class="stat"><div class="stat-label">CONSULTATIONS <span class="stat-symbol">⌁</span></div><strong>{{ stats()?.consultationsInProgress?.length ?? '—' }} <small class="status-divider">open</small></strong><small>{{ stats()?.completedConsultationsToday ?? 0 }} completed today</small></article></section>
  <section class="consultation-status-panel"><div class="section-head"><div><p class="eyebrow">LIVE WORKFLOW</p><h2>Consultation status <span class="count-pill">{{ stats()?.consultationsInProgress?.length ?? 0 }} open</span></h2></div><a routerLink="/consultation" class="text-link">Open consultation room <span>↗</span></a></div><div class="status-list">@for (consultation of stats()?.consultationsInProgress ?? []; track consultation.id) { <article class="status-row"><span class="status-pill">IN PROGRESS</span><div class="status-patient"><strong>{{ consultation.patientName }}</strong><small>{{ consultation.reason || 'Consultation' }} · {{ consultation.mode === 'ONLINE' ? 'Online' : consultation.mode === 'WALK_IN' ? 'Walk-in' : 'In clinic' }}</small></div><span class="status-start">Started {{ consultation.startedAt | date:'h:mm a' }}</span>@if (consultation.appointmentId) { <a class="row-action" [routerLink]="['/consultation']" [queryParams]="{ appointmentId: consultation.appointmentId }">Resume →</a> } @else { <a class="row-action" [routerLink]="['/consultation']" [queryParams]="{ patientId: consultation.patientId }">Resume →</a> }@if (auth.session()?.role === 'DOCTOR') { <button class="status-close" type="button" (click)="closeConsultation(consultation)" [disabled]="closingId() === consultation.id">{{ closingId() === consultation.id ? 'Closing…' : 'Close' }}</button> }</article> } @empty { <div class="empty-state">{{ stats() ? 'No consultations are currently in progress.' : 'Consultation status is unavailable.' }}</div> }</div></section>
  <section class="dashboard-grid"><div class="schedule-panel"><div class="section-head"><div><p class="eyebrow">YOUR DAY</p><h2>Today's appointments <span class="count-pill">{{ appointments().length }}</span></h2></div><a routerLink="/appointments" class="text-link">Full schedule <span>↗</span></a></div>
    <div class="appointment-list">@for (appointment of appointments(); track appointment.id) { <article class="appointment-row"><time>{{ appointment.startsAt | date:'h:mm' }}<small>{{ appointment.startsAt | date:'a' }}</small></time><span class="timeline-dot" [class.live]="appointment.status === 'IN_PROGRESS'"></span><div class="appt-main"><strong>{{ appointment.patientName }}</strong><p>{{ appointment.reason || 'Consultation' }}</p></div><span class="mode-tag" [class.online-tag]="appointment.mode === 'ONLINE'" [class.clinic-tag]="appointment.mode === 'OFFLINE'">{{ appointment.mode === 'ONLINE' ? 'ONLINE' : 'IN CLINIC' }}</span><span class="appt-status">{{ appointment.status }}</span>@if (appointment.mode === 'ONLINE' && appointment.videoLink) { <a class="row-action" [href]="appointment.videoLink" target="_blank" rel="noopener noreferrer">Join ↗</a> }</article> } @empty { <div class="empty-state">{{ loading() ? 'Loading today’s appointments…' : 'No appointments scheduled today.' }}</div> }</div></div>
    <aside class="right-rail"><div class="focus-panel"><p class="eyebrow">NEXT APPOINTMENT</p>@if (nextAppointment(); as next) { <h2>{{ next.patientName }}</h2><p class="focus-detail">{{ next.startsAt | date:'h:mm a' }} <span>·</span> {{ next.mode === 'ONLINE' ? 'Online' : 'In clinic' }}</p><div class="focus-line"></div><div class="focus-meta"><span>Visit focus</span><strong>{{ next.reason || 'Consultation' }}</strong></div><a routerLink="/consultation" class="focus-cta">Open consultation <span>↗</span></a> } @else { <h2>Schedule clear</h2><p class="focus-detail">No upcoming appointments today.</p><a routerLink="/appointments" class="focus-cta">View schedule <span>↗</span></a> }</div>
  <div class="followup-panel"><p class="eyebrow">CARE CONTINUITY</p><h2>Follow-up records</h2><p class="followup-copy">Use patient case history to review follow-up timing and previous prescriptions.</p><a routerLink="/patients" class="text-link followup-link">Open patient records →</a></div></aside></section>
` })
export class DashboardComponent {
  private readonly api = inject(ClinicApiService);
  private readonly feedback = inject(FeedbackService);
  readonly auth = inject(AuthService);
  readonly stats = signal<DashboardStats | null>(null);
  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly closingId = signal('');
  readonly nextAppointment = computed(() => this.appointments().find((item) => item.status !== 'CANCELLED' && item.status !== 'COMPLETED') ?? null);
  readonly todayLabel = new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date()).toUpperCase();
  readonly revenueLabel = computed(() => {
    const value = this.stats()?.revenueToday;
    return value === undefined ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  });
  constructor() {
    this.loadStats();
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const to = new Date(from); to.setDate(to.getDate() + 1);
    this.api.appointments(from.toISOString(), to.toISOString()).subscribe({
      next: (items) => { this.appointments.set(items); this.loading.set(false); }, error: () => { this.loading.set(false); this.feedback.error('Could not load today’s appointments.'); },
    });
  }
  closeConsultation(consultation: DashboardConsultation): void {
    this.closingId.set(consultation.id);
    this.api.closeConsultation(consultation.id).subscribe({
      next: () => { this.closingId.set(''); this.feedback.success(`${consultation.patientName}'s consultation is complete.`); this.loadStats(); },
      error: () => { this.closingId.set(''); this.feedback.error('Could not close the consultation. Please try again.'); },
    });
  }
  private loadStats(): void {
    this.api.dashboardStats().subscribe({ next: (stats) => this.stats.set(stats), error: () => { this.stats.set(null); this.feedback.error('Could not load dashboard statistics.'); } });
  }
}

import { Component, inject, signal } from '@angular/core';
import { ClinicApiService } from '../core/clinic-api.service';
import { Patient } from '../core/models';

@Component({ selector: 'clinic-patient-portal', template: `
  <section class="page-heading"><div><p class="eyebrow">YOUR CLINIC RECORD</p><h1>My care</h1><p class="subheading">Your profile information on file with the clinic.</p></div></section>
  @if (patient(); as profile) { <section class="patient-portal"><div class="portal-name"><span class="patient-initial">{{ profile.firstName[0] }}{{ profile.lastName[0] }}</span><div><h2>{{ profile.firstName }} {{ profile.lastName }}</h2><p>{{ profile.email || profile.phone || 'Contact details not recorded' }}</p></div></div><dl><div><dt>Date of birth</dt><dd>{{ profile.dateOfBirth || 'Not recorded' }}</dd></div><div><dt>Case focus</dt><dd>{{ profile.chiefComplaints || 'Not recorded' }}</dd></div><div><dt>Medical history</dt><dd>{{ profile.medicalHistory || 'Not recorded' }}</dd></div></dl></section> } @else { <p class="empty-state">{{ loading() ? 'Loading your clinic profile…' : 'Your clinic profile could not be loaded. Contact the clinic to link your patient record.' }}</p> }
` })
export class PatientPortalComponent {
  private readonly api = inject(ClinicApiService);
  readonly patient = signal<Patient | null>(null);
  readonly loading = signal(true);
  constructor() {
    this.api.myProfile().subscribe({ next: (profile) => { this.patient.set(profile); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}
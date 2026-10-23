import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs';
import { ClinicApiService } from '../core/clinic-api.service';
import { Patient } from '../core/models';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-patients', imports: [ReactiveFormsModule, RouterLink], template: `
  <section class="page-heading"><div><p class="eyebrow">PATIENT RECORDS</p><h1>Patients</h1><p class="subheading">A complete view of the people in your care.</p></div><a class="primary-btn" routerLink="/patients/new">＋ <span>Add patient</span></a></section>
  <section class="list-toolbar"><div class="search-wrap"><span>⌕</span><input [formControl]="search" placeholder="Search by name or phone" aria-label="Search patients"></div><span class="result-count">{{ patients().length }} records</span></section>
  <section class="table-wrap"><table><thead><tr><th>PATIENT</th><th>CONTACT</th><th>CASE FOCUS</th><th>LAST VISIT</th><th>STATUS</th><th></th></tr></thead><tbody>
    @for (patient of patients(); track patient.id) { <tr><td><div class="table-patient"><span class="patient-initial">{{ initials(patient) }}</span><div><strong>{{ patient.firstName }} {{ patient.lastName }}</strong><small>{{ patient.gender || 'Patient' }} <span>·</span> {{ patient.dateOfBirth || 'DOB not recorded' }}</small></div></div></td><td>{{ patient.phone || patient.email || '—' }}</td><td class="case-focus">{{ patient.chiefComplaints || 'Case details not recorded' }}</td><td>—</td><td><span class="record-status">Active</span></td><td><button class="icon-action" title="Open patient record" aria-label="Open patient record" (click)="openPatientRecord(patient)">↗</button></td></tr> }
    @empty { <tr><td colspan="6" class="empty-state">{{ loading() ? 'Loading patient records…' : 'No matching patient records.' }}</td></tr> }
  </tbody></table></section>
` })
export class PatientsComponent {
  private readonly api = inject(ClinicApiService);
  private readonly feedback = inject(FeedbackService);
  readonly search = new FormControl('', { nonNullable: true });
  readonly patients = signal<Patient[]>([]);
  readonly loading = signal(true);
  constructor() {
    this.search.valueChanges.pipe(startWith(''), debounceTime(250), distinctUntilChanged(), switchMap((query) => this.api.patients(query))).subscribe({
      next: (records) => { this.patients.set(records); this.loading.set(false); },
      error: () => { this.patients.set([]); this.loading.set(false); this.feedback.error('Could not load patient records. Check your connection.'); },
    });
  }
  initials(patient: Patient): string { return `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase(); }
  openPatientRecord(patient: Patient): void {
    this.feedback.info(`Selected ${patient.firstName} ${patient.lastName}. Detailed patient view is not available yet.`);
  }
}
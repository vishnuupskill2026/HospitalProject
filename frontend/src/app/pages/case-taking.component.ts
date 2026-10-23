import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClinicApiService } from '../core/clinic-api.service';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-case-taking', imports: [ReactiveFormsModule, RouterLink], template: `
  <section class="page-heading"><div><p class="eyebrow">PATIENT RECORDS / NEW CASE</p><h1>Patient & case history</h1><p class="subheading">Record the person first, then the pattern of their experience.</p></div><a class="text-link" routerLink="/patients">← Back to patients</a></section>
  @if (saved()) { <div class="success-banner" role="status">Patient record saved. <a routerLink="/patients">View patient list →</a></div> } @if (error()) { <div class="error-banner" role="alert">{{ error() }}</div> }
  <form [formGroup]="form" (ngSubmit)="save()" class="case-form">
    <section class="form-section"><div class="form-section-title"><span>01</span><div><h2>Patient profile</h2><p>Demographics and safe contact details</p></div></div><div class="form-grid">
      <label>First name <input formControlName="firstName" required></label><label>Last name <input formControlName="lastName" required></label><label>Date of birth <input type="date" formControlName="dateOfBirth"></label><label>Gender <select formControlName="gender"><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></label><label>Phone <input type="tel" formControlName="phone"></label><label>Email <input type="email" formControlName="email"></label><label class="span-two">Address <input formControlName="address"></label><label>Emergency contact <input formControlName="emergencyContactName"></label><label>Emergency phone <input type="tel" formControlName="emergencyContactPhone"></label><label class="span-two">Medical history <textarea rows="2" formControlName="medicalHistory" placeholder="Relevant diagnoses, allergies, current care…"></textarea></label>
    </div></section>
    <section class="form-section"><div class="form-section-title"><span>02</span><div><h2>Chief complaints</h2><p>What brings the patient in, and for how long?</p></div></div><div class="form-grid"><label class="span-two">Complaint & location <textarea rows="3" formControlName="chiefComplaints" placeholder="Describe the complaint in the patient's own words…"></textarea></label><label>Duration <input formControlName="complaintDuration" placeholder="e.g. 6 months"></label></div></section>
    <section class="form-section"><div class="form-section-title"><span>03</span><div><h2>Physical generals</h2><p>Body-wide patterns, appetite, sleep and temperature</p></div></div><div class="form-grid"><label>Appetite <textarea rows="2" formControlName="appetite"></textarea></label><label>Thirst <textarea rows="2" formControlName="thirst"></textarea></label><label>Cravings <textarea rows="2" formControlName="cravings"></textarea></label><label>Aversions <textarea rows="2" formControlName="aversions"></textarea></label><label>Thermal reaction <textarea rows="2" formControlName="thermalReaction" placeholder="Hot / chilly; sensitivity to weather…"></textarea></label><label>Perspiration <textarea rows="2" formControlName="perspiration"></textarea></label><label>Sleep <textarea rows="2" formControlName="sleep"></textarea></label><label>Dreams <textarea rows="2" formControlName="dreams"></textarea></label></div></section>
    <section class="form-section"><div class="form-section-title"><span>04</span><div><h2>Mind & modalities</h2><p>Emotional state, fears, aggravations and ameliorations</p></div></div><div class="form-grid"><label>Disposition <textarea rows="2" formControlName="disposition"></textarea></label><label>Fears <textarea rows="2" formControlName="fears"></textarea></label><label>Anxiety <textarea rows="2" formControlName="anxiety"></textarea></label><label>Emotional state <textarea rows="2" formControlName="emotionalState"></textarea></label><label>Aggravations (worse) <textarea rows="2" formControlName="aggravations" placeholder="e.g. cold air, after midnight…"></textarea></label><label>Ameliorations (better) <textarea rows="2" formControlName="ameliorations" placeholder="e.g. gentle motion, warmth…"></textarea></label><label>Other modalities <textarea rows="2" formControlName="modalities"></textarea></label><label>Past history <textarea rows="2" formControlName="pastHistory"></textarea></label><label>Family history <textarea rows="2" formControlName="familyHistory"></textarea></label></div></section>
    <footer class="form-footer"><span>Clinical notes are saved to the patient record.</span><button type="submit" class="primary-btn" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save patient record' }} <span>→</span></button></footer>
  </form>
` })
export class CaseTakingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ClinicApiService);
  private readonly router = inject(Router);
  private readonly feedback = inject(FeedbackService);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required], lastName: ['', Validators.required], dateOfBirth: [''], gender: [''], phone: [''], email: [''], address: [''],
    emergencyContactName: [''], emergencyContactPhone: [''], medicalHistory: [''], chiefComplaints: [''], complaintDuration: [''],
    appetite: [''], thirst: [''], cravings: [''], aversions: [''], thermalReaction: [''], perspiration: [''], sleep: [''], dreams: [''],
    mentalGenerals: [''], disposition: [''], fears: [''], anxiety: [''], emotionalState: [''], modalities: [''], aggravations: [''], ameliorations: [''], pastHistory: [''], familyHistory: [''],
  });
  save(): void {
    if (this.form.invalid) {
      this.feedback.invalidForm(this.form, { firstName: 'First name', lastName: 'Last name' });
      return;
    }
    const value = this.form.getRawValue(); this.saving.set(true); this.error.set('');
    this.api.createPatient(value).subscribe({
      next: () => { this.saving.set(false); this.saved.set(true); void this.router.navigate(['/patients']).then(() => this.feedback.success('Patient record saved successfully.')); },
      error: () => { this.saving.set(false); this.error.set('Could not save this record. Check the connection and try again.'); this.feedback.error('Could not save the patient record. Check your connection and try again.'); },
    });
  }
}
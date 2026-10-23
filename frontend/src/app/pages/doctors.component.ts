import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClinicApiService } from '../core/clinic-api.service';
import { DoctorAccount } from '../core/models';
import { FeedbackService } from '../core/feedback.service';

@Component({
  selector: 'clinic-doctors',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-heading">
      <div><p class="eyebrow">TEAM ACCESS</p><h1>Doctors</h1><p class="subheading">Create individual logins so doctors can work at the same time.</p></div>
      <button class="primary-btn" type="button" (click)="toggleForm()">＋ <span>{{ showForm() ? 'Close form' : 'Add doctor' }}</span></button>
    </section>

    @if (showForm()) {
      <form class="booking-form doctor-create-form" [formGroup]="form" (ngSubmit)="create()">
        <div class="form-grid">
          <label>Doctor email<input type="email" formControlName="email" autocomplete="off" placeholder="doctor@clinic.com"></label>
          <label>Initial password<input type="password" formControlName="initialPassword" autocomplete="new-password" placeholder="At least 14 characters"><small>Give this password to the doctor privately. They can sign in immediately.</small></label>
        </div>
        <div class="booking-actions"><span>Passwords are stored as secure hashes and never shown again.</span><button class="primary-btn" type="submit" [disabled]="saving()">{{ saving() ? 'Creating…' : 'Create doctor login' }} <span>→</span></button></div>
      </form>
    }

    <section class="table-wrap doctor-table-wrap">
      <table><thead><tr><th>DOCTOR ACCOUNT</th><th>ACCESS</th><th>STATUS</th></tr></thead><tbody>
        @for (doctor of doctors(); track doctor.id) {
          <tr><td><div class="table-patient"><span class="patient-initial">{{ initials(doctor.email) }}</span><div><strong>{{ doctor.email }}</strong><small>{{ doctor.admin ? 'Clinic admin' : 'Individual sign-in' }}</small></div></div></td><td>{{ doctor.admin ? 'Admin doctor' : 'Doctor' }}</td><td><span class="record-status">{{ doctor.enabled ? 'Active' : 'Disabled' }}</span></td></tr>
        }
        @empty { <tr><td colspan="3" class="empty-state">{{ loading() ? 'Loading doctor accounts…' : 'No doctor accounts found.' }}</td></tr> }
      </tbody></table>
    </section>
  `,
})
export class DoctorsComponent {
  private readonly api = inject(ClinicApiService);
  private readonly fb = inject(FormBuilder);
  private readonly feedback = inject(FeedbackService);
  readonly doctors = signal<DoctorAccount[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly showForm = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    initialPassword: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(128)]],
  });

  constructor() { this.loadDoctors(); }

  initials(email: string): string { return email.slice(0, 2).toUpperCase(); }

  toggleForm(): void {
    this.showForm.update((shown) => !shown);
    this.feedback.info(this.showForm() ? 'Doctor account form opened.' : 'Doctor account form closed.');
  }

  create(): void {
    if (this.form.invalid) {
      this.feedback.invalidForm(this.form, { email: 'Valid doctor email', initialPassword: 'Initial password (14–128 characters)' });
      return;
    }
    const { email, initialPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.api.createDoctor(email, initialPassword).subscribe({
      next: (doctor) => {
        this.saving.set(false);
        this.form.reset({ email: '', initialPassword: '' });
        this.showForm.set(false);
        this.feedback.success(`Doctor account created for ${doctor.email}. Share the initial password privately.`);
        this.loadDoctors();
      },
      error: (error: { status?: number }) => {
        this.saving.set(false);
        this.feedback.error(error.status === 409 ? 'An account with this email already exists.' : 'Could not create the doctor account. Check the email and password length.');
      },
    });
  }

  private loadDoctors(): void {
    this.api.doctors().subscribe({
      next: (items) => { this.doctors.set(items); this.loading.set(false); },
      error: () => { this.loading.set(false); this.feedback.error('Could not load doctor accounts.'); },
    });
  }
}

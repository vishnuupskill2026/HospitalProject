import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-login', imports: [ReactiveFormsModule, MatButtonModule], template: `
  <main class="login-page"><section class="login-panel"><a class="brand login-brand" href="/login"><span class="brand-mark">H</span><span>Hearth<span class="brand-light"> clinic</span></span></a>
    <p class="eyebrow">PRACTICE MANAGEMENT</p><h1>Welcome back.</h1><p class="login-sub">Sign in to open your clinic workspace.</p>
    <form [formGroup]="form" (ngSubmit)="submit()"><label>Email address<input type="email" formControlName="email" autocomplete="username" placeholder="doctor@clinic.com"></label><label>Password<input type="password" formControlName="password" autocomplete="current-password" placeholder="Enter password"></label>
      @if (error()) { <p class="form-error" role="alert">{{ error() }}</p> }<button mat-flat-button class="primary-btn login-submit" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in to clinic' }} <span>→</span></button>
    </form><p class="login-note">Use an account provisioned by your clinic administrator.</p>
  </section><aside class="login-art"><span>FIELD NOTES <b>01 / 04</b></span><div class="art-copy"><p>THE ART OF CARE</p><h2>Every detail<br>tells a story.</h2><div class="art-rule"></div><small>Thoughtful records for whole-person medicine.</small></div><div class="art-plant">✳</div></aside></main>
` })
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly feedback = inject(FeedbackService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  submit(): void {
    if (this.form.invalid) {
      this.feedback.invalidForm(this.form, { email: 'Email address', password: 'Password' });
      return;
    }
    this.busy.set(true); this.error.set('');
    this.auth.login(this.form.controls.email.value, this.form.controls.password.value).subscribe({
      next: () => { this.busy.set(false); this.feedback.success('Signed in successfully.'); void this.router.navigate(['/dashboard']); },
      error: () => { this.busy.set(false); this.error.set('Sign-in failed. Check your credentials or connection.'); this.feedback.error('Sign-in failed. Check your email and password.'); },
    });
  }
}
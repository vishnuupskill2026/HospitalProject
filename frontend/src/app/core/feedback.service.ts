import { Injectable, signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

export type FeedbackKind = 'success' | 'error' | 'info';
export interface FeedbackMessage { id: number; kind: FeedbackKind; text: string; }

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  readonly current = signal<FeedbackMessage | null>(null);
  private nextId = 0;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  success(text: string): void { this.show('success', text); }
  error(text: string): void { this.show('error', text); }
  info(text: string): void { this.show('info', text); }

  invalidForm(form: FormGroup, labels: Record<string, string>): void {
    form.markAllAsTouched();
    const missing: string[] = [];
    const invalid: string[] = [];
    for (const [name, control] of Object.entries(form.controls)) {
      if (!control.invalid) continue;
      const label = labels[name] ?? name;
      if (control.hasError('required')) missing.push(label);
      else invalid.push(label);
    }
    const details = [missing.length ? `Required: ${missing.join(', ')}` : '', invalid.length ? `Check: ${invalid.join(', ')}` : '']
      .filter(Boolean).join('. ');
    this.error(details || 'Please check the form and try again.');
  }

  dismiss(): void {
    this.current.set(null);
    if (this.timeout) clearTimeout(this.timeout);
  }

  private show(kind: FeedbackKind, text: string): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.current.set({ id: ++this.nextId, kind, text });
    this.timeout = setTimeout(() => this.current.set(null), kind === 'error' ? 7000 : 4500);
  }
}

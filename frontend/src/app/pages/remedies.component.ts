import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ClinicApiService } from '../core/clinic-api.service';
import { Remedy } from '../core/models';
import { FeedbackService } from '../core/feedback.service';

@Component({ selector: 'clinic-remedies', imports: [ReactiveFormsModule], template: `
  <section class="page-heading"><div><p class="eyebrow">PHARMACY</p><h1>Remedy inventory</h1><p class="subheading">Review available potencies and stock levels.</p></div>@if (auth.session()?.role === 'DOCTOR') { <button class="primary-btn" type="button" (click)="toggleForm()">＋ <span>{{ adding() ? 'Close form' : 'Add remedy' }}</span></button> }</section>
  @if (error()) { <div class="error-banner" role="alert">{{ error() }}</div> }
  @if (adding()) { <form class="booking-form" [formGroup]="form" (ngSubmit)="create()"><div class="form-grid"><label>Remedy name<input formControlName="name" required></label><label>Potency<input formControlName="potency" placeholder="30C, 200CH, 1M, Q" required></label><label>Form<input formControlName="form" placeholder="Pills, liquid, mother tincture"></label><label>Quantity on hand<input type="number" min="0" formControlName="quantityOnHand"></label><label>Reorder level<input type="number" min="0" formControlName="reorderLevel"></label><label>Unit price<input type="number" min="0" step="0.01" formControlName="unitPrice"></label></div><div class="booking-actions"><span>Stock counts are not decremented by prescriptions yet.</span><button class="primary-btn" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save remedy' }} <span>→</span></button></div></form> }
  <section class="inventory-summary"><div><span>ACTIVE REMEDIES</span><strong>{{ remedies().length }}</strong></div><div><span>LOW STOCK</span><strong>{{ lowStock() }}</strong></div><p>Stock is informational; dispensing and stock adjustments are not enabled yet.</p></section>
  <section class="table-wrap"><table><thead><tr><th>REMEDY</th><th>POTENCY</th><th>FORM</th><th>ON HAND</th><th>REORDER LEVEL</th><th>STATUS</th></tr></thead><tbody>
    @for (remedy of remedies(); track remedy.id) { <tr><td><strong class="remedy-name">{{ remedy.name }}</strong></td><td>{{ remedy.potency }}</td><td>{{ remedy.form || '—' }}</td><td>{{ remedy.quantityOnHand }}</td><td>{{ remedy.reorderLevel }}</td><td><span class="record-status" [class.stock-low]="remedy.quantityOnHand <= remedy.reorderLevel">{{ remedy.quantityOnHand <= remedy.reorderLevel ? 'Reorder' : 'In stock' }}</span></td></tr> }
    @empty { <tr><td colspan="6" class="empty-state">{{ loading() ? 'Loading remedy catalog…' : 'No remedies are configured yet.' }}</td></tr> }
  </tbody></table></section>
` })
export class RemediesComponent {
  private readonly api = inject(ClinicApiService);
  private readonly fb = inject(FormBuilder);
  private readonly feedback = inject(FeedbackService);
  readonly auth = inject(AuthService);
  readonly remedies = signal<Remedy[]>([]);
  readonly loading = signal(true);
  readonly lowStock = signal(0);
  readonly adding = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ name: ['', Validators.required], potency: ['', Validators.required], form: [''], quantityOnHand: [0, Validators.min(0)], reorderLevel: [0, Validators.min(0)], unitPrice: [0, Validators.min(0)] });
  constructor() {
    this.api.remedies().subscribe({
      next: (items) => { this.remedies.set(items); this.lowStock.set(items.filter((item) => item.quantityOnHand <= item.reorderLevel).length); this.loading.set(false); },
      error: () => { this.loading.set(false); this.feedback.error('Could not load remedy inventory. Check your connection.'); },
    });
  }
  toggleForm(): void {
    const opening = !this.adding();
    this.adding.set(opening);
    this.feedback.info(opening ? 'New remedy form opened.' : 'New remedy form closed.');
  }
  create(): void {
    if (this.form.invalid) {
      this.feedback.invalidForm(this.form, { name: 'Remedy name', potency: 'Potency', quantityOnHand: 'Quantity on hand', reorderLevel: 'Reorder level', unitPrice: 'Unit price' });
      return;
    }
    this.saving.set(true); this.error.set('');
    this.api.createRemedy(this.form.getRawValue()).subscribe({
      next: (remedy) => { this.remedies.update((items) => [...items, remedy].sort((a, b) => a.name.localeCompare(b.name))); this.lowStock.update((n) => n + (remedy.quantityOnHand <= remedy.reorderLevel ? 1 : 0)); this.saving.set(false); this.adding.set(false); this.form.reset({ name: '', potency: '', form: '', quantityOnHand: 0, reorderLevel: 0, unitPrice: 0 }); this.feedback.success(`${remedy.name} ${remedy.potency} added to inventory.`); },
      error: (err: { status?: number }) => { this.saving.set(false); this.error.set(err.status === 409 ? 'This remedy and potency are already in the catalog.' : 'Could not save the remedy. Check the details and try again.'); this.feedback.error(err.status === 409 ? 'This remedy and potency already exist.' : 'Could not save the remedy. Check the details and try again.'); },
    });
  }
}
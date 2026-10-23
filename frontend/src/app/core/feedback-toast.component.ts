import { Component, inject } from '@angular/core';
import { FeedbackService } from './feedback.service';

@Component({
  selector: 'clinic-feedback-toast',
  template: `
    @if (feedback.current(); as message) {
      <div class="feedback-toast" [class]="'feedback-toast feedback-' + message.kind"
           [attr.role]="message.kind === 'error' ? 'alert' : 'status'" aria-live="polite">
        <span class="feedback-icon" aria-hidden="true">{{ message.kind === 'success' ? '✓' : message.kind === 'error' ? '!' : 'i' }}</span>
        <span class="feedback-text">{{ message.text }}</span>
        <button type="button" class="feedback-dismiss" aria-label="Dismiss message" (click)="feedback.dismiss()">×</button>
      </div>
    }
  `,
})
export class FeedbackToastComponent {
  readonly feedback = inject(FeedbackService);
}

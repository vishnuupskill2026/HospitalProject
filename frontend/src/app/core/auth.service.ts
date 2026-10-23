import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthSession } from './models';
import { FeedbackService } from './feedback.service';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly feedback = inject(FeedbackService);
  login(email: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(apiUrl('/api/v1/auth/login'), { email, password }).pipe(
      tap((session) => sessionStorage.setItem('clinic-session', JSON.stringify({ ...session, expiresAt: Date.now() + session.expiresInSeconds * 1000 }))),
    );
  }
  session(): AuthSession | null {
    try {
      const session = JSON.parse(sessionStorage.getItem('clinic-session') ?? 'null') as (AuthSession & { expiresAt?: number }) | null;
      if (session?.expiresAt && Date.now() >= session.expiresAt) { sessionStorage.removeItem('clinic-session'); return null; }
      return session;
    }
    catch { return null; }
  }
  logout(): void { sessionStorage.removeItem('clinic-session'); this.feedback.success('Signed out successfully.'); void this.router.navigate(['/login']); }
}
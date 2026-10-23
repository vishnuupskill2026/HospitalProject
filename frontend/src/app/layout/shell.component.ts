import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({ selector: 'clinic-shell', imports: [RouterLink, RouterLinkActive, RouterOutlet], template: `
  <div class="app-frame"><aside class="sidebar">
    <a class="brand" routerLink="/dashboard"><span class="brand-mark">H</span><span>Hearth<span class="brand-light"> clinic</span></span></a>
    <p class="nav-label">WORKSPACE</p><nav aria-label="Main navigation">
      @if (auth.session()?.role === 'PATIENT') { <a routerLink="/my-care" routerLinkActive="active"><span class="nav-glyph">◎</span>My care</a> }
      @if (auth.session()?.role !== 'PATIENT') { <a routerLink="/dashboard" routerLinkActive="active"><span class="nav-glyph">◫</span>Overview</a><a routerLink="/patients" routerLinkActive="active"><span class="nav-glyph">◎</span>Patients</a><a routerLink="/appointments" routerLinkActive="active"><span class="nav-glyph">▦</span>Appointments</a><a routerLink="/remedies" routerLinkActive="active"><span class="nav-glyph">✳</span>Remedies</a> }
      @if (auth.session()?.role === 'DOCTOR') { <a routerLink="/consultation" routerLinkActive="active"><span class="nav-glyph">✳</span>Consultation</a><a routerLink="/patients/new" routerLinkActive="active"><span class="nav-glyph">＋</span>New case</a> }
      @if (auth.session()?.role === 'DOCTOR' && auth.session()?.admin) { <a routerLink="/doctors" routerLinkActive="active"><span class="nav-glyph">＋</span>Doctors</a> }
    </nav><div class="sidebar-bottom"><div class="doctor-badge">{{ auth.session()?.role === 'PATIENT' ? 'PT' : 'AM' }}</div><div class="doctor-copy"><strong>{{ auth.session()?.email }}</strong><small>{{ auth.session()?.role }}</small></div><button class="logout" aria-label="Sign out" title="Sign out" (click)="auth.logout()">↗</button></div>
  </aside><main class="main-area"><header class="topbar"><div class="crumb">HOMEOPATHIC PRACTICE <span>/</span> <b>CLINIC DESK</b></div><div class="topbar-right"><span class="today">{{ today }}</span><span class="status-dot"></span><span>Clinic open</span></div></header><div class="page-wrap"><router-outlet /></div></main></div>
` })
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
}
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { PatientsComponent } from './pages/patients.component';
import { CaseTakingComponent } from './pages/case-taking.component';
import { ConsultationComponent } from './pages/consultation.component';
import { AppointmentsComponent } from './pages/appointments.component';
import { RemediesComponent } from './pages/remedies.component';
import { PatientPortalComponent } from './pages/patient-portal.component';
import { DoctorsComponent } from './pages/doctors.component';
import { adminGuard, homeGuard, roleGuard } from './core/role.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', component: ShellComponent, canActivate: [authGuard], children: [
		{ path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR', 'STAFF'] } },
		{ path: 'patients', component: PatientsComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR', 'STAFF'] } },
		{ path: 'patients/new', component: CaseTakingComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR', 'STAFF'] } },
		{ path: 'consultation', component: ConsultationComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR'] } },
		{ path: 'doctors', component: DoctorsComponent, canActivate: [adminGuard] },
		{ path: 'appointments', component: AppointmentsComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR', 'STAFF'] } },
		{ path: 'remedies', component: RemediesComponent, canActivate: [roleGuard], data: { roles: ['DOCTOR', 'STAFF'] } },
		{ path: 'my-care', component: PatientPortalComponent, canActivate: [roleGuard], data: { roles: ['PATIENT'] } },
		{ path: '', pathMatch: 'full', canActivate: [homeGuard], component: DashboardComponent },
	] },
	{ path: '**', redirectTo: 'dashboard' },
];

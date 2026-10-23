import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

export const roleGuard: CanActivateFn = (route) => {
  const session = inject(AuthService).session();
  const allowed = route.data['roles'] as Role[] | undefined;
  if (session && allowed?.includes(session.role)) return true;
  return inject(Router).createUrlTree([session?.role === 'PATIENT' ? '/my-care' : '/dashboard']);
};

export const homeGuard: CanActivateFn = () => {
  const session = inject(AuthService).session();
  return inject(Router).createUrlTree([session?.role === 'PATIENT' ? '/my-care' : '/dashboard']);
};

export const adminGuard: CanActivateFn = () => {
  const session = inject(AuthService).session();
  if (session?.role === 'DOCTOR' && session.admin) return true;
  return inject(Router).createUrlTree([session?.role === 'PATIENT' ? '/my-care' : '/dashboard']);
};
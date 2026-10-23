import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  try {
    const session = JSON.parse(sessionStorage.getItem('clinic-session') ?? 'null') as { accessToken?: string } | null;
    if (session?.accessToken) return true;
  } catch { sessionStorage.removeItem('clinic-session'); }
  return inject(Router).createUrlTree(['/login']);
};
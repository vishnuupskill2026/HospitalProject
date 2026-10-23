import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  try {
    const session = JSON.parse(sessionStorage.getItem('clinic-session') ?? 'null') as { accessToken?: string } | null;
    if (session?.accessToken) request = request.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } });
  } catch { sessionStorage.removeItem('clinic-session'); }
  return next(request);
};
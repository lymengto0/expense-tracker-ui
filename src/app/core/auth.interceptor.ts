import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith(API_URL);
  const isAuthCall = req.url.includes('/auth/');

  if (isApi && auth.token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } });
  }

  return next(req).pipe(
    catchError((err) => {
      // A 401 from login means "wrong password"
      if (err.status === 401 && isApi && !isAuthCall) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
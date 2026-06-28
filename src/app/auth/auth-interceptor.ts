import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const apiUrl = environment.API_URL;

  // Adiciona o token para todas as requests para o backend
  if (token && apiUrl && req.url.startsWith(`${apiUrl}/`)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};

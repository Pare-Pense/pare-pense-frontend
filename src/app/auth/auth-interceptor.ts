import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const apiUrl = 'http://localhost:3000';

  // Adiciona o token para todas as requests para o backend
  if (token && apiUrl && req.url.startsWith(`${apiUrl}/`)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};

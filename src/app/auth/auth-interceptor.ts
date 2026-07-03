import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

function throttle(ms: number) {
  let id = -1;
  return (f: () => void) => {
    if (id === -1) {
      f();
    }
    clearTimeout(id);
    id = setTimeout(() => {
      id = -1;
    }, ms);
  };
}

// evita mostrar o mesmo erro varias vezes,
// caso multiplas requisições falhem de uma vez só
const throttleToken = throttle(1000);
const throttleForaDoAr = throttle(2000);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  const token = localStorage.getItem('token');
  const apiUrl = environment.API_URL;

  // Adiciona o token para todas as requests para o backend
  if (token && apiUrl && req.url.startsWith(`${apiUrl}/`)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.startsWith(`${apiUrl}/`)) {
        if (error.status === 401 && error.error?.erro === 'Token inválido') {
          router.navigate(['/login']);
          throttleToken(() => {
            messageService.add({
              severity: 'error',
              summary: 'Sessão expirada',
              detail: 'Seu token expirou, faça login novamente.',
            });
          });
        } else if (error.status === 0) {
          throttleForaDoAr(() => {
            messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível conectar com o servidor.',
            });
          });
        }
      }

      return throwError(() => error);
    }),
  );
};

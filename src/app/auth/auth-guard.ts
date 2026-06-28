import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  } else {
    // guarda a pagina que não foi permitida o acesso
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }
};

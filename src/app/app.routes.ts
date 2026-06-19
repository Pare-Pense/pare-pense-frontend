import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './auth/auth-guard';
import { PerfilPage } from './pages/perfil-page/perfil-page';

export const routes: Routes = [
  {
    path: 'home',
    component: DashboardPage,
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    component: PerfilPage,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];

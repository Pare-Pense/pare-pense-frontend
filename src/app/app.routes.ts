import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';

export const routes: Routes = [
  {
    path: 'home',
    component: DashboardPage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
];

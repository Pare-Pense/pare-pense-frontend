import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './auth/auth-guard';
import { PerfilPage } from './pages/perfil-page/perfil-page';
import { ExpensesPage } from './pages/despesas-page/despesas-page';
import { IncomesPage } from './pages/receitas-page/receitas-page';
import { RegisterPage } from './pages/register-page/register-page';

export const routes: Routes = [
  {
    path: 'home',
    component: DashboardPage,
    canActivate: [authGuard],
    title: 'Dashboard - Pare & Pense',
  },
  {
    path: 'perfil',
    component: PerfilPage,
    canActivate: [authGuard],
    title: 'Perfil - Pare & Pense',
  },
  {
    path: 'login',
    component: LoginPage,
    title: 'Login - Pare & Pense',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'despesas',
    component: ExpensesPage,
    canActivate: [authGuard],
    title: 'Despesas - Pare & Pense',
  },
  {
    path: 'receitas',
    component: IncomesPage,
    canActivate: [authGuard],
    title: 'Receitas - Pare & Pense',
  },
  {
    path: 'register',
    component: RegisterPage,
    title: 'Cadastro - Pare & Pense',
  },
];

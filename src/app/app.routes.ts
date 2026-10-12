import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './auth/auth-guard';
import { PerfilPage } from './pages/perfil-page/perfil-page';
import { FinancasPage } from './pages/financas-page/financas-page';
import { RegisterPage } from './pages/register-page/register-page';
import { CategoriasPage } from './pages/categorias-page/categorias-page';
import { RecorrentesPage } from './pages/recorrentes-page/recorrentes-page';

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
    component: FinancasPage,
    canActivate: [authGuard],
    title: 'Despesas - Pare & Pense',
    data: { isDespesa: true },
  },
  {
    path: 'receitas',
    component: FinancasPage,
    canActivate: [authGuard],
    title: 'Receitas - Pare & Pense',
    data: { isDespesa: false },
  },
  {
    path: 'categorias',
    component: CategoriasPage,
    canActivate: [authGuard],
    title: 'Categorias - Pare & Pense',
  },
  {
    path: 'recorrentes',
    component: RecorrentesPage,
    canActivate: [authGuard],
    title: 'Despesas recorrentes - Pare & Pense',
  },
  {
    path: 'register',
    component: RegisterPage,
    title: 'Cadastro - Pare & Pense',
  },
];

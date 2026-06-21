import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { LoginPage } from './pages/login-page/login-page';
import { ExpensesPage } from './pages/despesas-page/despesas-page';
import { IncomesPage } from './pages/receitas-page/receitas-page';

export const routes: Routes = [
  {
    path: 'home',
    component: DashboardPage,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'expenses',
    component: ExpensesPage,
  },
  {
    path: 'incomes',
    component: IncomesPage,
  }

];

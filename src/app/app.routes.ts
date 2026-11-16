import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { CategoriesComponent } from './categories/categories.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
   { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
   { path: 'categories', component: CategoriesComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
]
  
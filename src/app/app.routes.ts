import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { EmployeeCrudComponent } from './pages/employee-crud/employee-crud.component';
import { CardManagementComponent } from './pages/card-management/card-management.component';
import { AssignCardComponent } from './assign-card/assign-card.component';
import { ApprenantCrudComponent } from './pages/apprenant-crud/apprenant-crud.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { PointagesComponent } from './pointages/pointages.component';
import { StructuresComponent } from './structures/structures.component';
//import { ApprenantsComponent } from './apprenants/apprenants.component';
import { EmployesComponent } from './employes/employes.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Route par défaut
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'employee-crud', component: EmployeeCrudComponent},
  { path: 'card-management', component: CardManagementComponent },
  { path: 'assign-card/:id', component: AssignCardComponent},
  { path: 'apprenant-crud', component: ApprenantCrudComponent},
  { path: 'sidebar', component: SidebarComponent},
  { path: 'pointages', component: PointagesComponent }, // La route pour afficher les pointages
  { path: 'structures', component: StructuresComponent }, // La route pour afficher les structures
  //{ path: 'apprenants', component: ApprenantsComponent }, // La route pour afficher les structures
  { path: 'employes', component: EmployesComponent }, // La route pour afficher les structures
];

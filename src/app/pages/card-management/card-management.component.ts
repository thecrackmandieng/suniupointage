import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AssignCardComponent } from '../../assign-card/assign-card.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-card-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.css'],
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, SidebarComponent],
  providers: [EmployeeService]
})
export class CardManagementComponent implements OnInit {
  employees: any[] = [];
  loading = true;
  selectedEmployee: any = null;

  constructor(private employeeService: EmployeeService, private router: Router) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any[]) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des employés', err);
        this.loading = false;
      }
    });
  }

  openAssignCard(employeeId: string): void {
    if (!employeeId) {
      console.error('Employee ID is undefined or null');
      return;
    }
  
    console.log('Navigating to assign-card with ID:', employeeId);
    this.router.navigate(['/assign-card', employeeId]).then(() => {
      console.log('Navigation successful');
    }).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
  

  onAssignCard(cardId: string): void {
    console.log('onAssignCard called with cardId:', cardId);
    if (this.selectedEmployee && cardId) {
      this.selectedEmployee.cardID = cardId;
      this.employeeService.updateEmployee(this.selectedEmployee).subscribe({
        next: (updatedEmployee: any) => {
          console.log('Card assigned successfully:', updatedEmployee);
          this.selectedEmployee = null;
        },
        error: (err: any) => {
          console.error('Error assigning card:', err);
        }
      });
    }
  }
}

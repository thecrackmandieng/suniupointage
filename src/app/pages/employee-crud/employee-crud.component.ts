import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-crud',
  standalone: true,
  templateUrl: './employee-crud.component.html',
  styleUrls: ['./employee-crud.component.css'],
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [EmployeeService]
})
export class EmployeeCrudComponent implements OnInit {
  employees: any[] = [];
  searchQuery: string = '';
  loading = true;
  selectedEmployee: any = null;
  showModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showBlockModal = false;
  employeeToConfirm: any = null;
  editForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  departements: any[] = [];
  cohortes: any[] = [];
  

  constructor(private employeeService: EmployeeService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      photo: [''],
      role: ['', Validators.required],
      departement_id: [''],
      cohorte_id: ['']
    });
  }

  ngOnInit(): void {
    this.fetchEmployees();
    this.fetchDepartements();
    this.fetchCohortes();
  }

  fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data.map(employee => ({ ...employee, status: 'active', selected: false })); // Set default status to 'active' and selected to false
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des employés', err);
        this.loading = false;
      }
    });
  }

  fetchDepartements(): void {
    // Ajouter la logique pour récupérer les départements
    this.departements = [
      { _id: '1', nom: 'Département 1' },
      { _id: '2', nom: 'Département 2' }
    ];
  }

  fetchCohortes(): void {
    // Ajouter la logique pour récupérer les cohortes
    this.cohortes = [
      { _id: '1', nom: 'Cohorte 1' },
      { _id: '2', nom: 'Cohorte 2' }
    ];
  }

  uploadCsv(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.parseCsvFile(file);
    }
  }

  private parseCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result as string;
      const rows = csvData.split('\n').filter(row => row.trim() !== '');
      const newEmployees = rows.map(row => {
        const columns = row.split(',');
        return {
          name: columns[0],
          email: columns[1],
          function: columns[2],
          role: columns[3],
          selected: false,
          status: 'active' // Ajouter le statut par défaut
        };
      });
      this.employees = [...this.employees, ...newEmployees];
    };
    reader.readAsText(file);
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.employees.forEach(employee => {
      employee.selected = checked;
    });
  }

  hasSelectedEmployees(): boolean {
    return this.employees.some(employee => employee.selected);
  }

  deleteSelectedEmployees(): void {
    const selectedEmployees = this.employees.filter(employee => employee.selected);
    const userIds = selectedEmployees.map(employee => employee._id);

    console.log('Suppression des employés avec les IDs:', userIds);

    this.employeeService.deleteMultipleEmployees(userIds).subscribe({
      next: (response) => {
        console.log('Réponse de la suppression:', response);
        this.employees = this.employees.filter(employee => !employee.selected);
        this.successMessage = 'Employés supprimés avec succès';
      },
      error: (err) => {
        console.error('Erreur lors de la suppression des employés', err);
        if (err.status === 400) {
          this.errorMessage = 'Erreur de validation des IDs des employés';
        } else if (err.status === 404) {
          this.errorMessage = 'Employés non trouvés';
        } else {
          this.errorMessage = 'Erreur inconnue lors de la suppression des employés';
        }
      }
    });
  }


  blockSelectedEmployees(): void {
    const selectedEmployees = this.employees.filter(employee => employee.selected);
    selectedEmployees.forEach(employee => {
      this.employeeService.blockEmployee(employee._id).subscribe({
        next: (data) => {
          const index = this.employees.findIndex(emp => emp._id === data._id);
          if (index !== -1) {
            this.employees[index] = data;
          }
          this.successMessage = 'Employés bloqués avec succès';
        },
        error: (err) => {
          console.error('Erreur lors du blocage de l\'employé', err);
          this.errorMessage = 'Erreur lors du blocage de l\'employé';
        }
      });
    });
  }

  editEmployee(employee: any): void {
    this.employeeToConfirm = employee;
    this.editForm.patchValue(employee);
    this.showEditModal = true;
  }

  viewEmployee(employee: any): void {
    this.selectedEmployee = employee;
    this.showModal = true;
  }

  deleteEmployee(employee: any): void {
    this.employeeToConfirm = employee;
    this.showDeleteModal = true;
  }

  blockEmployee(employee: any): void {
    this.employeeToConfirm = employee;
    this.showBlockModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEmployee = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.employeeToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeeToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
    this.employeeToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirmEditEmployee(): void {
    if (this.editForm.valid && this.employeeToConfirm._id) {
      const updatedEmployee = { ...this.employeeToConfirm, ...this.editForm.value };
      console.log('Editing employee with ID:', this.employeeToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.updateEmployee(updatedEmployee).subscribe({
        next: (data) => {
          const index = this.employees.findIndex(emp => emp._id === data._id);
          if (index !== -1) {
            this.employees[index] = data;
          }
          this.successMessage = 'Employé modifié avec succès';
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'employé', err);
          this.errorMessage = 'Erreur lors de la modification de l\'employé';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'employé non défini';
    }
  }

  confirmDeleteEmployee(): void {
    if (this.employeeToConfirm._id) {
      console.log('Deleting employee with ID:', this.employeeToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.deleteEmployee(this.employeeToConfirm._id).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp._id !== this.employeeToConfirm._id);
          this.successMessage = 'Employé supprimé avec succès';
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'employé', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'employé';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'employé non défini';
    }
  }

  confirmBlockEmployee(): void {
    if (this.employeeToConfirm._id) {
      console.log('Blocking employee with ID:', this.employeeToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.blockEmployee(this.employeeToConfirm._id).subscribe({
        next: (data) => {
          const index = this.employees.findIndex(emp => emp._id === data._id);
          if (index !== -1) {
            this.employees[index] = data;
          }
          this.successMessage = 'Employé bloqué avec succès';
          this.closeBlockModal();
        },
        error: (err) => {
          console.error('Erreur lors du blocage de l\'employé', err);
          this.errorMessage = 'Erreur lors du blocage de l\'employé';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'employé non défini';
    }
  }

  onSearchClick() {
    console.log('Recherche pour:', this.searchQuery);
    // Ajouter la logique pour filtrer les employés ou effectuer une recherche
  }
}

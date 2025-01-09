import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApprenantService } from '../../services/apprenant.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-apprenant-crud',
  templateUrl: './apprenant-crud.component.html',
  styleUrls: ['./apprenant-crud.component.css'],
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent],
  providers: [ApprenantService]
})
export class ApprenantCrudComponent implements OnInit {
  apprenants: any[] = [];
  searchQuery: string = '';
  loading = true;
  selectedApprenant: any = null;
  showModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showBlockModal = false;
  apprenantToConfirm: any = null;
  editForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  cohortes: any[] = [];
  photoPreview: string | ArrayBuffer | null = null; // Ajoutez cette ligne pour définir la propriété photoPreview

  constructor(private employeeService: ApprenantService, private fb: FormBuilder) {
    this.editForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      photo: [''],
      role: ['apprenant', Validators.required],
      cohorte_id: ['']
    });
  }

  ngOnInit(): void {
    this.fetchApprenants();
    this.fetchCohortes();
  }

  fetchApprenants(): void {
    this.employeeService.getApprenants().subscribe({
      next: (data) => {
        this.apprenants = data.map(apprenant => ({ ...apprenant, status: 'active', selected: false })); // Set default status to 'active' and selected to false
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des apprenants', err);
        this.loading = false;
      }
    });
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
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string | ArrayBuffer | null; // Corrigez le typage ici
      };
      reader.readAsDataURL(file);
    }
  }

  private parseCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const csvData = reader.result as string;
      const rows = csvData.split('\n').filter(row => row.trim() !== '');
      const newApprenants = rows.map(row => {
        const columns = row.split(',');
        return {
          name: columns[0],
          email: columns[1],
          function: columns[2],
          role: 'apprenant',
          selected: false,
          status: 'active' // Ajouter le statut par défaut
        };
      });
      this.apprenants = [...this.apprenants, ...newApprenants];
    };
    reader.readAsText(file);
  }

  selectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.apprenants.forEach(apprenant => {
      apprenant.selected = checked;
    });
  }

  hasSelectedApprenants(): boolean {
    return this.apprenants.some(apprenant => apprenant.selected);
  }

  deleteSelectedApprenants(): void {
    const selectedApprenants = this.apprenants.filter(apprenant => apprenant.selected);
    selectedApprenants.forEach(apprenant => {
      this.employeeService.deleteApprenant(apprenant._id).subscribe({
        next: () => {
          this.apprenants = this.apprenants.filter(app => app._id !== apprenant._id);
          this.successMessage = 'Apprenants supprimés avec succès';
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'apprenant', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'apprenant';
        }
      });
    });
  }

  blockSelectedApprenants(): void {
    const selectedApprenants = this.apprenants.filter(apprenant => apprenant.selected);
    selectedApprenants.forEach(apprenant => {
      this.employeeService.blockApprenant(apprenant._id).subscribe({
        next: (data) => {
          const index = this.apprenants.findIndex(app => app._id === data._id);
          if (index !== -1) {
            this.apprenants[index] = data;
          }
          this.successMessage = 'Apprenants bloqués avec succès';
        },
        error: (err) => {
          console.error('Erreur lors du blocage de l\'apprenant', err);
          this.errorMessage = 'Erreur lors du blocage de l\'apprenant';
        }
      });
    });
  }

  editApprenant(apprenant: any): void {
    this.apprenantToConfirm = apprenant;
    this.editForm.patchValue(apprenant);
    this.showEditModal = true;
  }

  viewApprenant(apprenant: any): void {
    this.selectedApprenant = apprenant;
    this.showModal = true;
  }

  deleteApprenant(apprenant: any): void {
    this.apprenantToConfirm = apprenant;
    this.showDeleteModal = true;
  }

  blockApprenant(apprenant: any): void {
    this.apprenantToConfirm = apprenant;
    this.showBlockModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedApprenant = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.apprenantToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.apprenantToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeBlockModal(): void {
    this.showBlockModal = false;
    this.apprenantToConfirm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirmEditApprenant(): void {
    if (this.editForm.valid && this.apprenantToConfirm._id) {
      const updatedApprenant = { ...this.apprenantToConfirm, ...this.editForm.value };
      console.log('Editing apprenant with ID:', this.apprenantToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.updateApprenant(updatedApprenant).subscribe({
        next: (data) => {
          const index = this.apprenants.findIndex(app => app._id === data._id);
          if (index !== -1) {
            this.apprenants[index] = data;
          }
          this.successMessage = 'Apprenant modifié avec succès';
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Erreur lors de la modification de l\'apprenant', err);
          this.errorMessage = 'Erreur lors de la modification de l\'apprenant';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'apprenant non défini';
    }
  }

  confirmDeleteApprenant(): void {
    if (this.apprenantToConfirm._id) {
      console.log('Deleting apprenant with ID:', this.apprenantToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.deleteApprenant(this.apprenantToConfirm._id).subscribe({
        next: () => {
          this.apprenants = this.apprenants.filter(app => app._id !== this.apprenantToConfirm._id);
          this.successMessage = 'Apprenant supprimé avec succès';
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'apprenant', err);
          this.errorMessage = 'Erreur lors de la suppression de l\'apprenant';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'apprenant non défini';
    }
  }

  confirmBlockApprenant(): void {
    if (this.apprenantToConfirm._id) {
      console.log('Blocking apprenant with ID:', this.apprenantToConfirm._id); // Ajouter un log pour vérifier l'ID
      this.employeeService.blockApprenant(this.apprenantToConfirm._id).subscribe({
        next: (data) => {
          const index = this.apprenants.findIndex(app => app._id === data._id);
          if (index !== -1) {
            this.apprenants[index] = data;
          }
          this.successMessage = 'Apprenant bloqué avec succès';
          this.closeBlockModal();
        },
        error: (err) => {
          console.error('Erreur lors du blocage de l\'apprenant', err);
          this.errorMessage = 'Erreur lors du blocage de l\'apprenant';
        }
      });
    } else {
      this.errorMessage = 'ID de l\'apprenant non défini';
    }
  }

  onSearchClick() {
    console.log('Recherche pour:', this.searchQuery);
    // Ajouter la logique pour filtrer les apprenants ou effectuer une recherche
  }
}

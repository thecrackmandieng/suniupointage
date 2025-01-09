import { Component, AfterViewInit, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Ajoutez cette ligne pour éviter l'erreur de TypeScript
declare const bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: true,
  imports: [HttpClientModule, CommonModule, ReactiveFormsModule, FormsModule ],
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [EmployeeService]
})
export class AdminDashboardComponent implements AfterViewInit {
  photoPreview: string | ArrayBuffer | null = null;
  userPhoto: string | null = null; // Ajoutez cette ligne pour définir la propriété userPhoto

  constructor(private http: HttpClient, private employeeService: EmployeeService) {}

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart(): void {
    const ctx = document.getElementById('chart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        datasets: [
          {
            label: 'Apprenants',
            data: [12, 19, 3, 5, 2, 3, 7],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Employés',
            data: [8, 15, 5, 10, 6, 4, 9],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  openRegistrationModal() {
    const specificFieldsContainer = document.getElementById('specificFields');
    if (!specificFieldsContainer) return;

    // Réinitialiser les champs spécifiques
    specificFieldsContainer.innerHTML = '';

    // Utilisation correcte du modal Bootstrap
    const modalElement = document.getElementById('registrationModal') as HTMLElement;
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  updateSpecificFields(event: Event) {
    const specificFieldsContainer = document.getElementById('specificFields');
    if (!specificFieldsContainer) return;

    const role = (event.target as HTMLSelectElement).value;

    if (role === 'employe') {
      specificFieldsContainer.innerHTML = `
        <div class="mb-3">
          <label for="fonction" class="form-label">Fonction</label>
          <input type="text" class="form-control" id="fonction" name="fonction" ngModel />
        </div>
        <div class="mb-3">
          <label for="departement" class="form-label">Département</label>
          <input type="text" class="form-control" id="departement" name="departement" ngModel />
        </div>
      `;
    } else if (role === 'apprenant') {
      specificFieldsContainer.innerHTML = `
        <div class="mb-3">
          <label for="cohorte" class="form-label">Cohorte</label>
          <input type="text" class="form-control" id="cohorte" name="cohorte" ngModel />
        </div>
      `;
    }
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

  submitRegistrationForm() {
    const form = document.getElementById('registrationForm') as HTMLFormElement;
    const formData = new FormData(form);

    this.employeeService.createUser(formData).subscribe(
      response => {
        console.log('Utilisateur créé avec succès', response);
        // Fermer le modal d'inscription
        const registrationModalElement = document.getElementById('registrationModal') as HTMLElement;
        const registrationModal = bootstrap.Modal.getInstance(registrationModalElement);
        registrationModal?.hide();

        // Mettre à jour l'URL de la photo de l'utilisateur
        this.userPhoto = `http://127.0.0.1:8000/photos/${response.photo}`;

        // Ouvrir le modal de succès
        const successModalElement = document.getElementById('successModal') as HTMLElement;
        const successModal = new bootstrap.Modal(successModalElement);
        successModal.show();
      },
      error => {
        console.error('Erreur lors de la création de l\'utilisateur', error);
      }
    );
  }
}

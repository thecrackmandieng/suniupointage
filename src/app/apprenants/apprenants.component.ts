/*import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';  // Ajoutez cette ligne
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprenantService } from '../services/apprenant.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';




interface Apprenant {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  adresse?: string;
  photo?: File;
  fonction?: string;
  matricule?: string;
  selected?: boolean;
  is_active?: boolean; // Make it optional
  telephone?: string;
  role?:'';
}

interface Cohorte {
  id: number;
  nom: string;
}


@Component({
  selector: 'app-apprenants',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, HttpClientModule ],
  templateUrl: './apprenants.component.html',
  styleUrls: ['./apprenants.component.css']
})
export class ApprenantsComponent implements OnInit {
 /* apprenants: Apprenant[] = [];
  cohortes: Cohorte[] = [];
  selectedCohorte: string = '677bdd89d371305888075814';
  selectedApprenants: Apprenant[] = [];
  page: number = 1;
  size: number = 6;
  apprenant: any = null; // Pour stocker les informations de l'apprenant
  showModal: boolean = false; // Variable pour contrôler la visibilité du modal


  currentPages: number = 1;


  notificationMessage: string = '';
  notificationClass: string = '';
  selectedApprenant: any;
  showApprenantModal: boolean = false;

  isEditing: boolean = false; // Contrôle l'affichage du formulaire d'édition
  errorMessages: string[] = []; // Contient les messages d'erreurs de validatio

  isLoading: boolean = false;  // Ajoutez cette ligne pour gérer le loader


   // Méthode pour fermer le modal
   closeModal(): void {
    this.showModal = false;
    this.apprenant = null; // Réinitialiser les données de l'apprenant
  }

  // Variables pour la gestion des modals
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  actionToConfirm: Function | null = null;

  isImporting = false; // pour afficher ou cacher le modal
  selectedFile: File | null = null;
  cohorteId: string = ''; // Exemple de cohorteId sous forme de string (à ajuster selon votre contexte)



  constructor(private apprenantService: ApprenantService , private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCohortes();
    this.loadApprenants();
  }

  loadCohortes(): void {
    this.apprenantService.getCohortes().subscribe(
      (data: Cohorte[]) => {
        console.log('Liste des cohortes :', data);
        this.cohortes = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des cohortes :', error);
      }
    );
  }

  loadApprenants(): void {
    this.apprenantService.getApprenantsByCohorte(this.selectedCohorte).subscribe(
      (response: Apprenant[]) => {
        console.log('Réponse complète :', response);
        if (response && Array.isArray(response)) {
          this.apprenants = response.map((apprenant: Apprenant) => ({
            ...apprenant,
            selected: false, // Default value
          }));
        } else {
          console.error('Format de réponse inattendu :', response);
          this.apprenants = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des apprenants :', error);
        this.apprenants = [];
      }
    );
  }
  onCohorteChange(): void {
    if (this.selectedCohorte) {
      this.loadApprenants();
    }
  }

  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
    const lastInitial = nom ? nom.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  toggleSelectAll(event: any): void {
    this.apprenants.forEach((apprenant) => (apprenant.selected = event.target.checked));
    this.updateSelectedApprenants();
  }

  updateSelectedApprenants(): void {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  filterSelected() {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  getSelectedIds() {
    const ids = this.selectedApprenants.map((a) => a.id);
    console.log('Selected IDs:', ids);
  }

  bulkDelete(): void {
    if (this.selectedApprenants.length === 0) return;
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir supprimer ces apprenants ?',
      () => {
        this.selectedApprenants.forEach((apprenant) => {
          this.apprenantService.deleteApprenant(apprenant.id).subscribe(() => {
            this.showNotification(`Apprenant supprimé avec succès`);
            this.loadApprenants();
          });
        });
      }
    );
  }

  bulkBlock(): void {
    if (this.selectedApprenants.length === 0) return;
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir bloquer ces apprenants ?',
      () => {
        this.selectedApprenants.forEach((apprenant) => {
          this.apprenantService.blockApprenant(apprenant.id).subscribe(() => {
            this.showNotification(`Apprenant bloqué avec succès`);
            this.loadApprenants();
          });
        });
      }
    );
  }

   

  // Fermer le modal sans importer
  closeImportDialog() {
    this.isImporting = false;
    this.selectedFile = null; // Réinitialiser le fichier sélectionné
  }

  // Gérer la sélection du fichier
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

 // Ouvrir la boîte de dialogue d'importation CSV pour les apprenants
openApprenantCSVImportDialog(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv'; // Accepter uniquement les fichiers CSV

  input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
          this.importApprenantCSV(file);
      }
  };

  input.click(); // Ouvrir la boîte de dialogue pour sélectionner le fichier
}

// Importer le fichier CSV via le service apprenant
importApprenantCSV(file: File): void {
  this.apprenantService.importCSV(file).Observable(
      (response:any) => {
          // Afficher le message de succès
          this.showNotification('L\'importation des apprenants a été réussie !');
          console.log('Fichier CSV importé avec succès:', response);
      },
      (error:any) => {
          // Afficher les erreurs
          this.showNotification('Erreur lors de l\'importation : ' + error.message);
          console.error('Erreur lors de l\'importation du fichier CSV:', error);
      }
  );
}

  editApprenant(apprenant: any): void {
    this.apprenant = { ...apprenant }; // Crée une copie des données de l'apprenant pour l'édition
    this.isEditing = true; // Affiche le formulaire d'édition
    this.errorMessages = []; // Réinitialise les messages d'erreur
  }

  validateField(field: any): void {
    if (field.invalid && field.touched) {
      if (field.errors?.required) {
        this.errorMessages.push(`${field.name} est requis.`);
      }
      if (field.errors?.pattern) {
        this.errorMessages.push(`${field.name} doit respecter le format requis.`);
      }
      if (field.errors?.email) {
        this.errorMessages.push(`L'email est invalide.`);
      }
    } else {
      // Filtre les messages d'erreur liés à ce champ
      this.errorMessages = this.errorMessages.filter(
        (message) => !message.includes(field.name)
      );
    }
  }

  isFormValid(): boolean {
    return Object.values(this.apprenant).every(value => typeof value === 'string' ? value.trim() !== '' : value);
  }

  onSubmit(): void {
    if (this.isEditing) {
      this.apprenantService.updateApprenant(this.apprenant).subscribe(
        (data) => {
          this.showNotification('Apprenant mis à jour avec succès', false);
          this.closeEditModal();
        },
        (error) => {
          this.showNotification('Erreur lors de la mise à jour de l\'apprenant', true);
          console.error('Erreur lors de la mise à jour de l\'apprenant', error);
        }
      );
    }
  }



  // Fermer le modal
  closeEditModal(): void {
    this.isEditing = false;
  }



  viewApprenant(apprenant: any) {
    this.selectedApprenant = apprenant;
    this.showApprenantModal = true;
  }

  closeApprenantModal() {
    this.showApprenantModal = false;
    this.selectedApprenant = null;
  }
  // Method to show notification message
  showNotification(message: string, isError: boolean = false): void {
    this.notificationMessage = message;
    this.notificationClass = isError ? 'error' : 'success';

    // Automatically hide the notification after 5 seconds
    setTimeout(() => {
      this.notificationMessage = '';
    }, 5000);
  }

  // Modal logic
  openConfirmationModal(message: string, action: Function): void {
    this.confirmationMessage = message;
    this.actionToConfirm = action;
    this.showConfirmationModal = true;
  }

  confirmAction(): void {
    if (this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.closeConfirmationModal();
  }

  cancelAction(): void {
    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationMessage = '';
    this.actionToConfirm = null;
  }

  // Example of usage corrected: Block an apprenant
  confirmBlockApprenant(apprenant: Apprenant): void {
    this.openConfirmationModal(
      `Voulez-vous vraiment bloquer ${apprenant.prenom} ${apprenant.nom} ?`,
      () => this.blockApprenant(apprenant) // Action after confirmation
    );
  }

  blockApprenant(apprenant: Apprenant): void {
    this.apprenantService.blockApprenant(apprenant.id).subscribe(
      (response) => {
        this.showNotification(`Apprenant ${apprenant.prenom} ${apprenant.nom} bloqué avec succès`);
        this.loadApprenants(); // Reload apprenants after the action
      },
      (error) => {
        this.showNotification('Erreur lors du blocage de l\'apprenant', true);
      }
    );
  }

  // Example of usage corrected: Delete an apprenant
  deleteApprenant(apprenant: Apprenant): void {
    this.openConfirmationModal(
      'Êtes-vous sûr de vouloir supprimer cet apprenant ?',
      () => {
        this.apprenantService.deleteApprenant(apprenant.id).subscribe((response) => {
          this.showNotification(`Apprenant supprimé avec succès`);
          this.loadApprenants(); // Reload apprenants after deletion
        });
      }
    );
  }

  
  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadApprenants();
    }
  }

  nextPage(): void {
    this.page++;
    this.loadApprenants();
  }

  onApprenantSelect(apprenant: Apprenant, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedApprenants.push(apprenant);
    } else {
      this.selectedApprenants = this.selectedApprenants.filter(e => e.id !== apprenant.id);
    }
  }




}*/
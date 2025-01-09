import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PointageService } from '../services/pointage.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../pages/sidebar/sidebar.component';

@Component({
  selector: 'app-pointages',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SidebarComponent],
  templateUrl: './pointages.component.html',
  styleUrls: ['./pointages.component.css']
})
export class PointagesComponent implements OnInit, AfterViewInit {
  pointages: any[] = []; // Stocke les données des pointages
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 5; // Nombre d'éléments par page
  totalItems: number=0; // Nombre total d'éléments
  paginatedPointages: any[] = []; // Tableau de pointages paginés
  selectedPointage: any = null; // Stocke le pointage sélectionné pour modification
  isModalOpen: boolean = false; // Contrôle l'affichage du modal
  isSaving: boolean = false; // Contrôle l'état de l'enregistrement
  isSuccessModalOpen: boolean = false; // Contrôle l'affichage du modal de succès

  constructor(private pointageService: PointageService) {}

  ngOnInit(): void {
    this.loadPointages();
  }

  ngAfterViewInit(): void {
    // Écoute l'événement de clic après que la vue a été initialisée
    this.setupModalClose();
  }

  /**
   * Charge les données des pointages depuis le service.
   */
  loadPointages(): void {
    this.pointageService.getPointages().subscribe(
      (data) => {
        this.pointages = data.map((pointage) => {
          const firstTime = pointage.firstTime ? new Date(`${pointage.date}T${pointage.firstTime}`) : null;

          if (!firstTime) {
            pointage.status = 'Absent';
          } else if (firstTime.getHours() > 8) {
            pointage.status = 'Retard';
          } else {
            pointage.status = 'Présent';
          }

          return pointage;
        });

        this.totalItems = this.pointages.length; // Mettre à jour le nombre total d'éléments
        this.updatePaginatedPointages(); // Mettre à jour les pointages paginés
      },
      (error) => {
        console.error('Erreur lors de la récupération des pointages:', error);
      }
    );
  }

  /**
   * Met à jour le tableau des pointages paginés en fonction de la page actuelle
   */
  updatePaginatedPointages(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPointages = this.pointages.slice(startIndex, endIndex);
  }

  /**
   * Change la page courante et met à jour les pointages affichés
   */
  changePage(page: number): void {
    if (page < 1 || page > Math.ceil(this.totalItems / this.itemsPerPage)) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedPointages();
  }

  /**
   * Ouvre le modal et charge les données du pointage sélectionné.
   */
  openModal(pointage: any): void {
    this.selectedPointage = { ...pointage }; // Dupliquez le pointage pour ne pas modifier directement les données d'origine
    this.isModalOpen = true;
  }

  /**
   * Ferme le modal.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Envoie les modifications au backend.
   */
  onEnregistrer(): void {
    this.isSaving = true; // Active l'indicateur de sauvegarde

    this.pointageService.updatePointage(this.selectedPointage).subscribe(
      (updatedPointage) => {
        const index = this.pointages.findIndex(p => p.id === updatedPointage.id); // Assurez-vous que l'id correspond au modèle de données
        if (index !== -1) {
          this.pointages[index] = updatedPointage; // Mettre à jour le pointage modifié dans le tableau
        }
        this.closeModal(); // Ferme le modal d'édition
        this.isSaving = false; // Désactive l'indicateur de sauvegarde

        // Afficher le modal de succès
        this.isSuccessModalOpen = true;
        console.log('Succès : Modal ouvert');
      },
      (error) => {
        this.isSaving = false; // Désactive l'indicateur de sauvegarde en cas d'erreur
        console.error('Erreur lors de la mise à jour du pointage:', error);
      }
    );
  }

  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }

  submitModification() {
    this.isSaving = true;
    console.log('Bouton Enregistrer cliqué');

    // Simuler une action (comme un appel à l'API)
    setTimeout(() => {
      this.isSaving = false;
      alert('Données enregistrées avec succès !');
    }, 2000);
  }

  /**
   * Gère la fermeture du modal lorsqu'on clique à l'extérieur
   */
  setupModalClose(): void {
    const modal = document.getElementById('myModal'); // Assurez-vous que votre modal a l'id 'myModal'
    
    if (modal) {
      window.onclick = (event: MouseEvent) => {
        if (event.target === modal) {
          this.closeModal();
        }
      };
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../services/employee.service';
import { RfidService } from '../../../mon-projet-arduino/services/rfid.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from "../pages/sidebar/sidebar.component";

declare var bootstrap: any; // Pour accéder aux modals Bootstrap

@Component({
  selector: 'app-assign-card',
  templateUrl: './assign-card.component.html',
  styleUrls: ['./assign-card.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  providers: [EmployeeService],
})
export class AssignCardComponent implements OnInit, OnDestroy {
  employeeId: string = '';
  employee: any = {};
  cardId: string = ''; // Champ Card ID
  private cardIdInterval: any;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private rfidService: RfidService, // Injecter le service RFID
    private router: Router // Injecter le service Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID à partir de l'URL
    this.route.paramMap.subscribe((params) => {
      this.employeeId = params.get('id') || '';
      console.log('Employee ID:', this.employeeId);

      if (this.employeeId) {
        this.loadEmployeeData();
      }
    });

    // Charger les données RFID en temps réel
    this.cardIdInterval = setInterval(() => {
      this.loadCardId();
    }, 1000); // Rafraîchir toutes les secondes
  }

  ngOnDestroy(): void {
    if (this.cardIdInterval) {
      clearInterval(this.cardIdInterval);
    }
  }

  loadEmployeeData(): void {
    this.employeeService.getUserById(this.employeeId).subscribe(
      (data) => {
        console.log('Données de l\'employé récupérées:', data);
        this.employee = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des informations de l\'employé', error);
      }
    );
  }

  // Charger l'UID de la carte
  loadCardId(): void {
    this.rfidService.getCardData().subscribe(
      (data) => {
        if (data && data.cardId) {
          this.cardId = data.cardId; // Mettre à jour l'UID dans l'input
          console.log('Card ID reçu:', this.cardId);
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération du Card ID:', error);
      }
    );
  }

  onAssignCard(): void {
    console.log('Assignation de la carte avec Card ID:', this.cardId);

    if (!this.cardId) {
      this.showModal('noCardIdModal');
      return;
    }

    if (!this.employeeId) {
      this.showModal('noEmployeeModal');
      return;
    }

    this.employeeService.assignCard(this.employeeId, this.cardId).subscribe(
      (response) => {
        console.log('Carte assignée avec succès :', response);
        // Afficher le modal de succès
        this.showModal('successModal');
      },
      (error) => {
        console.error('Erreur lors de l\'assignation de la carte :', error);
        if (error.status === 409) {
          this.showModal('cardIdExistsModal');
        } else {
          this.showModal('errorModal');
        }
      }
    );
  }

  showModal(modalId: string): void {
    const modal = new bootstrap.Modal(document.getElementById(modalId)!);
    modal.show();
    setTimeout(() => {
      modal.hide();
      this.redirectToManagementCard();
    }, 3000);
  }

  redirectToManagementCard(): void {
    this.router.navigate(['/card-management']);
  }
}

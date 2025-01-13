import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = 'http://127.0.0.1:5000/login'; // URL pour la connexion classique
  private rfidLoginUrl = 'http://127.0.0.1:5000/events'; // URL pour la connexion via RFID
  private usersUrl = 'http://127.0.0.1:8000/api/utilisateurs'; // URL pour gérer les utilisateurs

  constructor(private http: HttpClient) {}

  /**
   * Connexion via email et mot de passe
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Observable des données de connexion
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { email, password }).pipe(
      catchError((error) => this.handleError('Erreur de connexion', error))
    );
  }

  /**
   * Connexion via RFID
   * @param rfidUID UID de la carte RFID
   * @returns Observable des données de connexion
   */
  loginWithRFID(rfidUID: string): Observable<any> {
    return this.http.post(this.rfidLoginUrl, { rfidUID }).pipe(
      catchError((error) => this.handleError('Erreur RFID', error))
    );
  }

  /**
   * Récupération de la liste des utilisateurs
   * @returns Observable contenant la liste des utilisateurs
   */
  getUsers(): Observable<any> {
    return this.http.get(this.usersUrl).pipe(
      catchError((error) => this.handleError('Erreur lors de la récupération des utilisateurs', error))
    );
  }

  /**
   * Création d'un nouvel utilisateur
   * @param userData Données de l'utilisateur à créer
   * @returns Observable de la réponse du serveur
   */
  createUser(userData: any): Observable<any> {
    console.log('Données envoyées pour la création de l\'utilisateur :', userData);

    // Ajouter les en-têtes nécessaires (par exemple, Content-Type pour envoyer du JSON)
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(this.usersUrl, userData, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        
        // Gestion détaillée des erreurs renvoyées par le serveur
        if (error.error && error.error.errors) {
          console.error('Détails des erreurs :', error.error.errors);
        }

        return this.handleError('Erreur lors de la création de l\'utilisateur', error);
      })
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   * @param context Message de contexte pour l'erreur
   * @param error Erreur HTTP
   * @returns Observable avec une erreur formatée
   */
  private handleError(context: string, error: any): Observable<never> {
    const errorMessage =
      error.error?.message || 'Erreur serveur (détails non disponibles)';
    console.error(`${context}:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}

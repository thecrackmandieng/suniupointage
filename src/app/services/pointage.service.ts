import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PointageService {
  private apiUrl = 'http://localhost:8000/api/pointages'; // URL de l'API backend
  private baseUrl = 'http://localhost:8000/api/pointages/${id}'; // URL de l'API backend


  constructor(private http: HttpClient) {}

  // Récupérer les pointages
  getPointages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  // Mettre à jour un pointage
  updatePointage(pointage: any): Observable<any> {
    console.log('Pointage envoyé:', pointage);

    // Ajout d'en-têtes si nécessaire (pour l'authentification ou pour spécifier que le corps est JSON)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.put<any>(`${this.baseUrl}/${pointage._id}`, pointage, { headers }).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }
  
  // Transformer les données pour les adapter au graphique
  getPointagesForChart(): Observable<any> {
    return this.getPointages().pipe(
      map((pointages) => {
        const groupedData: { [key: string]: { apprenants: number; employes: number } } = {};

        // Grouper les données par date
        pointages.forEach((pointage) => {
          const date = pointage.date;
          if (!groupedData[date]) {
            groupedData[date] = { apprenants: 0, employes: 0 };
          }

          // Exemple : vous pourriez différencier apprenants et employés ici
          groupedData[date].apprenants += 1; // Incrémenter pour chaque pointage
          groupedData[date].employes += 1; // Incrémenter pour chaque pointage
        });

        // Retourner un tableau pour le graphique
        return {
          labels: Object.keys(groupedData),
          apprenants: Object.values(groupedData).map((data) => data.apprenants),
          employes: Object.values(groupedData).map((data) => data.employes),
        };
      })
    );
  }

  // Fonction pour gérer les erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur: ${error.status}, Message: ${error.message}`;
    }

    // Afficher l'erreur dans la console et retourner un observable d'erreur
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

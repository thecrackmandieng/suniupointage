import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApprenantService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // URL de base de l'API

  constructor(private http: HttpClient) {}

  // Récupérer tous les apprenants
  getApprenants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users?role=apprenant`);
  }

  // Récupérer un apprenant par son ID
  getApprenantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  // Mettre à jour un apprenant
  updateApprenant(apprenant: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/maj/users/${apprenant._id}`, apprenant);
  }

  // Créer un apprenant
  createApprenant(userData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ajout/users`, userData);
  }

  // Supprimer un apprenant
  deleteApprenant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/sup/users/${id}`);
  }

  // Bloquer un apprenant
  blockApprenant(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/bloquer/users/${id}`, { status: 'blocked' });
  }
}

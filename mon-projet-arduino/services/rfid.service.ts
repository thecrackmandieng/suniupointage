import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RfidService {
  private apiUrl = 'http://localhost:3000/api/data'; // URL de l'API Node.js

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les données RFID
  getCardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}

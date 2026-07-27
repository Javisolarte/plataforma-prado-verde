import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Conjunto {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  contacto?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConjuntoService {
  private apiUrl = `${environment.apiUrl}/conjunto`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Conjunto[]> {
    return this.http.get<Conjunto[]>(this.apiUrl);
  }

  create(data: Partial<Conjunto>): Observable<Conjunto> {
    return this.http.post<Conjunto>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Conjunto>): Observable<Conjunto> {
    return this.http.patch<Conjunto>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

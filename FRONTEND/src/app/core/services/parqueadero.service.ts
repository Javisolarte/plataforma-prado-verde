import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Parqueadero {
  id: number;
  numero: string;
  tipo: string;
  torreId: number | null;
  apartamentoId: number | null;
  conjuntoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParqueaderoService {
  private apiUrl = `${environment.apiUrl}/parqueadero`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Parqueadero[]> {
    return this.http.get<Parqueadero[]>(this.apiUrl);
  }

  create(data: Partial<Parqueadero>): Observable<Parqueadero> {
    return this.http.post<Parqueadero>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Parqueadero>): Observable<Parqueadero> {
    return this.http.patch<Parqueadero>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

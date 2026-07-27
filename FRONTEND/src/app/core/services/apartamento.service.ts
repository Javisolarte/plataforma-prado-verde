import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Apartamento {
  id: number;
  numero: string;
  torreId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApartamentoService {
  private apiUrl = `${environment.apiUrl}/apartamento`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Apartamento[]> {
    return this.http.get<Apartamento[]>(this.apiUrl);
  }

  create(data: Partial<Apartamento>): Observable<Apartamento> {
    return this.http.post<Apartamento>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Apartamento>): Observable<Apartamento> {
    return this.http.patch<Apartamento>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

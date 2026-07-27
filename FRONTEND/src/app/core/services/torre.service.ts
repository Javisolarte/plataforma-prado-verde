import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Torre {
  id: number;
  nombre: string;
  conjuntoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TorreService {
  private apiUrl = `${environment.apiUrl}/torre`;
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<Torre[]> {
    return this.http.get<Torre[]>(this.apiUrl);
  }

  create(data: Partial<Torre>): Observable<Torre> {
    return this.http.post<Torre>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Torre>): Observable<Torre> {
    return this.http.patch<Torre>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

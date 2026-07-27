import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ResidenteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/residente`;

  findAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  generateAccount(id: number, accountData: any) {
    return this.http.post<any>(`${this.apiUrl}/${id}/generate-account`, accountData);
  }
}

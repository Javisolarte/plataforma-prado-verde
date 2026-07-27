import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  residentes: any[];
  vehiculos: any[];
  apartamentos?: any[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/search`;

  globalSearch(query: string, conjuntoId?: number) {
    let params = new HttpParams().set('q', query);
    if (conjuntoId) {
      params = params.set('conjuntoId', conjuntoId.toString());
    }
    return this.http.get<SearchResult>(this.apiUrl, { params });
  }
}



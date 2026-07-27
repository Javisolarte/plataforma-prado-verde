const fs = require('fs');
const path = require('path');

const services = ['torre', 'apartamento', 'parqueadero'];

services.forEach(svc => {
  const SvcUpper = svc.charAt(0).toUpperCase() + svc.slice(1);
  const serviceContent = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ${SvcUpper} {
  id: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ${SvcUpper}Service {
  private apiUrl = 'http://localhost:3000/api/v1/${svc}';
  
  constructor(private http: HttpClient) {}

  getAll(): Observable<${SvcUpper}[]> {
    return this.http.get<${SvcUpper}[]>(this.apiUrl);
  }

  create(data: Partial<${SvcUpper}>): Observable<${SvcUpper}> {
    return this.http.post<${SvcUpper}>(this.apiUrl, data);
  }

  update(id: number, data: Partial<${SvcUpper}>): Observable<${SvcUpper}> {
    return this.http.patch<${SvcUpper}>(\`\${this.apiUrl}/\${id}\`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(\`\${this.apiUrl}/\${id}\`);
  }
}
`;

  const destPath = path.join(__dirname, 'src', 'app', 'core', 'services', `${svc}.service.ts`);
  fs.writeFileSync(destPath, serviceContent);
});

console.log('Servicios Angular generados');

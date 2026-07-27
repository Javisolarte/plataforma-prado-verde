const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app', 'core', 'services');

function updateService(svc, interfaceBody) {
  const filePath = path.join(srcDir, `${svc}.service.ts`);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/export interface [A-Za-z]+ {\n  id: number;\n  \[key: string\]: any;\n}/, interfaceBody);
  fs.writeFileSync(filePath, content);
}

updateService('torre', `export interface Torre {\n  id: number;\n  nombre: string;\n  conjuntoId: number;\n}`);
updateService('apartamento', `export interface Apartamento {\n  id: number;\n  numero: string;\n  torreId: number;\n}`);
updateService('parqueadero', `export interface Parqueadero {\n  id: number;\n  numero: string;\n  tipo: string;\n  torreId: number | null;\n  apartamentoId: number | null;\n  conjuntoId: number;\n}`);

console.log('Interfaces actualizadas');

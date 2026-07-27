require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Iniciando inyección de 500 datos de prueba...');
  
  const conjunto = await prisma.conjunto.findFirst();
  if (!conjunto) {
    console.error('❌ No se encontró ningún conjunto.');
    return;
  }
  const conjuntoId = conjunto.id;
  console.log('✅ Usando el conjunto de pruebas ID:', conjuntoId);

  const prefijo = Math.floor(Math.random() * 1000);

  const torres = [];
  for (let i = 1; i <= 10; i++) {
    const t = await prisma.torre.create({
      data: { nombre: `Torre T${prefijo}-${i}`, conjuntoId }
    });
    torres.push(t);
  }
  console.log('✅ 10 Torres creadas.');

  const apartamentos = [];
  for (const t of torres) {
    for (let i = 1; i <= 50; i++) {
      const a = await prisma.apartamento.create({
        data: { numero: `Apt-${prefijo}-${t.nombre}-${i}`, torreId: t.id }
      });
      apartamentos.push(a);
    }
  }
  console.log('✅ 500 Apartamentos creados.');

  const parqueaderos = [];
  for (let i = 0; i < 500; i++) {
    const p = await prisma.parqueadero.create({
      data: {
        numero: `P${prefijo}-${i + 1}`,
        tipo: 'SENCILLO',
        conjuntoId,
        apartamentoId: apartamentos[i].id
      }
    });
    parqueaderos.push(p);
  }
  console.log('✅ 500 Parqueaderos creados.');

  const residentes = [];
  for (let i = 0; i < 500; i++) {
    const r = await prisma.residente.create({
      data: {
        nombre: `Residente Prueba ${prefijo}-${i + 1}`,
        cedula: `11${prefijo}${i.toString().padStart(4, '0')}`,
        telefono: `300${prefijo}${i.toString().padStart(4, '0')}`,
        conjuntoId
      }
    });
    
    await prisma.residenteApartamento.create({
      data: {
        residenteId: r.id,
        apartamentoId: apartamentos[i].id,
        tipo: 'PROPIETARIO'
      }
    });
    
    residentes.push(r);
  }
  console.log('✅ 500 Residentes creados.');

  for (let i = 0; i < 500; i++) {
    const num = i.toString().padStart(3, '0');
    const char1 = String.fromCharCode(65 + (prefijo % 26));
    const char2 = String.fromCharCode(65 + ((prefijo+1) % 26));
    
    await prisma.vehiculo.create({
      data: {
        placa: `${char1}${char2}X${num}`,
        tipo: 'CARRO',
        marca: 'TOYOTA',
        color: 'BLANCO',
        parqueaderoId: parqueaderos[i].id
      }
    });
  }
  console.log('✅ 500 Vehículos creados.');
  console.log('🎉 INYECCIÓN COMPLETADA.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); pool.end(); });

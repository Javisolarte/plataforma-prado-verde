import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando inyección de 500 datos de prueba...');
  
  const conjunto = await prisma.conjunto.findFirst();
  if (!conjunto) {
    console.error('❌ No se encontró ningún conjunto. Por favor crea uno primero.');
    return;
  }
  const conjuntoId = conjunto.id;
  console.log(`✅ Usando el conjunto de pruebas: ${conjunto.nombre} (ID: ${conjuntoId})`);

  const prefijo = Math.floor(Math.random() * 1000); // Para evitar duplicados si se ejecuta varias veces

  // 1. Crear 10 Torres
  const torres = [];
  for (let i = 1; i <= 10; i++) {
    const t = await prisma.torre.create({
      data: { nombre: `Torre T${prefijo}-${i}`, conjuntoId }
    });
    torres.push(t);
  }
  console.log('✅ 10 Torres creadas.');

  // 2. Crear 50 Apartamentos por Torre (total 500)
  const apartamentos = [];
  for (const t of torres) {
    for (let i = 1; i <= 50; i++) {
      const a = await prisma.apartamento.create({
        data: { numero: `Apt-${prefijo}-${t.nombre}-${i}`, torreId: t.id }
      });
      apartamentos.push(a);
    }
  }
  console.log('✅ 500 Apartamentos creados y asignados a sus torres.');

  // 3. Crear 500 Parqueaderos y asignarlos a los apartamentos
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
  console.log('✅ 500 Parqueaderos creados y asignados a apartamentos.');

  // 4. Crear 500 Residentes y vincularlos a los apartamentos
  const residentes = [];
  for (let i = 0; i < 500; i++) {
    const r = await prisma.residente.create({
      data: {
        nombre: `Residente Prueba ${prefijo}-${i + 1}`,
        documento: `11${prefijo}${i.toString().padStart(4, '0')}`,
        telefono: `300${prefijo}${i.toString().padStart(4, '0')}`,
        conjuntoId
      }
    });
    
    // Vincular al apartamento
    await prisma.residenteApartamento.create({
      data: {
        residenteId: r.id,
        apartamentoId: apartamentos[i].id,
        tipo: 'PROPIETARIO'
      }
    });
    
    residentes.push(r);
  }
  console.log('✅ 500 Residentes creados y viviendo en sus apartamentos.');

  // 5. Crear 500 Vehículos y asignarlos a los parqueaderos
  for (let i = 0; i < 500; i++) {
    const num = i.toString().padStart(3, '0');
    // Para que las letras varíen un poco según el prefijo
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
  console.log('✅ 500 Vehículos creados y parqueados.');

  console.log('🎉 INYECCIÓN COMPLETADA CON ÉXITO. EL SISTEMA ESTÁ LISTO PARA LA PRUEBA DE VELOCIDAD.');
}

main()
  .catch(e => {
    console.error('Error durante la inyección:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    const p = await prisma.parqueadero.create({
      data: {
        numero: 'TEST-123',
        tipo: 'SENCILLO',
        conjuntoId: 1
      }
    });
    console.log('EXITO:', p);
    await prisma.parqueadero.delete({ where: { id: p.id } });
  } catch(e) {
    console.log('ERROR PRISMA:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'API PRADO VERDE RUNNING';
  }

  async importData(data: any) {
    const { conjuntoId, filas } = data;
    if (!conjuntoId || !filas || !Array.isArray(filas)) {
      throw new BadRequestException('Formato de importación inválido');
    }

    let processed = 0;
    for (const row of filas) {
      if (!row.torre || !row.apto) continue;
      
      // 1. Torre
      let t = await this.prisma.torre.findFirst({ where: { nombre: row.torre, conjuntoId } });
      if (!t) t = await this.prisma.torre.create({ data: { nombre: row.torre, conjuntoId } });

      // 2. Apto
      let a = await this.prisma.apartamento.findUnique({ where: { numero_torreId: { numero: row.apto, torreId: t.id } } });
      if (!a) a = await this.prisma.apartamento.create({ data: { numero: row.apto, torreId: t.id } });

      // 3. Parqueadero
      let p = null;
      if (row.parqNumero) {
         p = await this.prisma.parqueadero.findFirst({ where: { numero: row.parqNumero, torreId: t.id } });
         if (!p) p = await this.prisma.parqueadero.create({ data: { numero: row.parqNumero, tipo: row.parqTipo || 'SENCILLO', torreId: t.id, apartamentoId: a.id, conjuntoId } });
      }

      // 4. Vehiculo
      if (p && row.placa) {
         let v = await this.prisma.vehiculo.findUnique({ where: { placa: row.placa } });
         if (!v) {
            await this.prisma.vehiculo.create({ data: { placa: row.placa, tipo: row.vehTipo || 'CARRO', parqueaderoId: p.id } });
         } else {
            await this.prisma.vehiculo.update({ where: { id: v.id }, data: { parqueaderoId: p.id } });
         }
      }

      // 5. Residente
      if (row.resNombre) {
         let r;
         if (row.resCedula) {
            r = await this.prisma.residente.findUnique({ where: { documento: row.resCedula } });
         }
         if (!r) {
            r = await this.prisma.residente.findFirst({ where: { nombre: row.resNombre, conjuntoId } });
         }
         if (!r) {
            r = await this.prisma.residente.create({ data: { nombre: row.resNombre, documento: row.resCedula || null, telefono: row.resTelefono || null, conjuntoId } });
         }

         const validTipos = ['PROPIETARIO', 'ARRENDATARIO', 'FAMILIAR'];
         const finalTipo = validTipos.includes(row.resTipo) ? row.resTipo : 'PROPIETARIO';

         const ra = await this.prisma.residenteApartamento.findFirst({ where: { residenteId: r.id, apartamentoId: a.id } });
         if (!ra) {
            await this.prisma.residenteApartamento.create({ data: { residenteId: r.id, apartamentoId: a.id, tipo: finalTipo as any } });
         }
      }
      processed++;
    }
    
    return { message: 'Importación exitosa', processed };
  }
}

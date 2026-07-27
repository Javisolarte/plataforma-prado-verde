import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParqueaderoService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (!data.conjuntoId) {
      throw new BadRequestException('El conjuntoId es obligatorio');
    }
    const conjuntoId = Number(data.conjuntoId);
    const torreId = data.torreId ? Number(data.torreId) : null;
    const apartamentoId = data.apartamentoId ? Number(data.apartamentoId) : null;
    const numero = String(data.numero || '').trim().toUpperCase();
    const tipo = data.tipo || 'SENCILLO';

    if (!numero) {
      throw new BadRequestException('El número de parqueadero es obligatorio');
    }

    const existing = await this.prisma.parqueadero.findFirst({
      where: { numero, conjuntoId }
    });

    if (existing) {
      return this.prisma.parqueadero.update({
        where: { id: existing.id },
        data: { torreId, apartamentoId, tipo }
      });
    }

    return this.prisma.parqueadero.create({
      data: { numero, tipo, conjuntoId, torreId, apartamentoId }
    });
  }

  findAll() {
    return this.prisma.parqueadero.findMany();
  }

  findOne(id: number) {
    return this.prisma.parqueadero.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    const payload: any = { ...data };
    if (payload.conjuntoId) payload.conjuntoId = Number(payload.conjuntoId);
    if (payload.torreId) payload.torreId = Number(payload.torreId);
    if (payload.apartamentoId) payload.apartamentoId = Number(payload.apartamentoId);
    if (payload.numero) payload.numero = String(payload.numero).trim().toUpperCase();
    return this.prisma.parqueadero.update({ where: { id }, data: payload });
  }

  remove(id: number) {
    return this.prisma.parqueadero.delete({ where: { id } });
  }
}

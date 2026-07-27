import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TorreService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (!data.conjuntoId) {
      throw new BadRequestException('El conjuntoId es obligatorio para crear la torre');
    }
    const conjuntoId = Number(data.conjuntoId);
    const nombre = String(data.nombre || '').trim().toUpperCase();

    if (!nombre) {
      throw new BadRequestException('El nombre de la torre es obligatorio');
    }

    const existing = await this.prisma.torre.findFirst({
      where: { nombre, conjuntoId }
    });
    if (existing) {
      return existing;
    }

    return this.prisma.torre.create({
      data: { nombre, conjuntoId }
    });
  }

  findAll() {
    return this.prisma.torre.findMany();
  }

  findOne(id: number) {
    return this.prisma.torre.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    const payload: any = { ...data };
    if (payload.conjuntoId) payload.conjuntoId = Number(payload.conjuntoId);
    if (payload.nombre) payload.nombre = String(payload.nombre).trim().toUpperCase();
    return this.prisma.torre.update({ where: { id }, data: payload });
  }

  remove(id: number) {
    return this.prisma.torre.delete({ where: { id } });
  }
}

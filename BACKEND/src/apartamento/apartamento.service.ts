import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApartamentoService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (!data.torreId) {
      throw new BadRequestException('La torreId es requerida para crear el apartamento');
    }
    const torreId = Number(data.torreId);
    const numero = String(data.numero || '').trim().toUpperCase();

    if (!numero) {
      throw new BadRequestException('El número de apartamento es obligatorio');
    }

    const existing = await this.prisma.apartamento.findFirst({
      where: { numero, torreId }
    });
    if (existing) {
      return existing;
    }

    return this.prisma.apartamento.create({
      data: { numero, torreId }
    });
  }

  findAll() {
    return this.prisma.apartamento.findMany();
  }

  findOne(id: number) {
    return this.prisma.apartamento.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    const payload: any = { ...data };
    if (payload.torreId) payload.torreId = Number(payload.torreId);
    if (payload.numero) payload.numero = String(payload.numero).trim().toUpperCase();
    return this.prisma.apartamento.update({ where: { id }, data: payload });
  }

  remove(id: number) {
    return this.prisma.apartamento.delete({ where: { id } });
  }
}

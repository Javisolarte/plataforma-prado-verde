import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApartamentoService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.apartamento.create({ data });
  }

  findAll() {
    return this.prisma.apartamento.findMany();
  }

  findOne(id: number) {
    return this.prisma.apartamento.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.apartamento.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.apartamento.delete({ where: { id } });
  }
}

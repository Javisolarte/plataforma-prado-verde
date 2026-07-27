import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConjuntoService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.conjunto.create({ data });
  }

  findAll() {
    return this.prisma.conjunto.findMany();
  }

  findOne(id: number) {
    return this.prisma.conjunto.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.conjunto.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.conjunto.delete({ where: { id } });
  }
}

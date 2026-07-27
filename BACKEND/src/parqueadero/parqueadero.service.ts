import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParqueaderoService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.parqueadero.create({ data });
  }

  findAll() {
    return this.prisma.parqueadero.findMany();
  }

  findOne(id: number) {
    return this.prisma.parqueadero.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.parqueadero.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.parqueadero.delete({ where: { id } });
  }
}

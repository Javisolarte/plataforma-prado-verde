import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TorreService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.torre.create({ data });
  }

  findAll() {
    return this.prisma.torre.findMany();
  }

  findOne(id: number) {
    return this.prisma.torre.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.torre.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.torre.delete({ where: { id } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiculoService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.vehiculo.create({ data });
  }

  findAll() {
    return this.prisma.vehiculo.findMany({
      include: {
        parqueadero: {
          include: {
            torre: true,
            apartamento: {
              include: {
                residentes: {
                  include: {
                    residente: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.vehiculo.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.vehiculo.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.vehiculo.delete({ where: { id } });
  }
}

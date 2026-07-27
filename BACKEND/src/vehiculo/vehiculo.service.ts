import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehiculoService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (!data.placa) {
      throw new BadRequestException('La placa del vehículo es requerida');
    }
    const placa = String(data.placa).trim().toUpperCase();
    const parqueaderoId = data.parqueaderoId ? Number(data.parqueaderoId) : undefined;
    const tipo = data.tipo || 'CARRO';

    const existing = await this.prisma.vehiculo.findFirst({
      where: { placa }
    });

    if (existing) {
      const updateData: any = { tipo, marca: data.marca, color: data.color };
      if (parqueaderoId !== undefined) updateData.parqueaderoId = parqueaderoId;
      return this.prisma.vehiculo.update({
        where: { id: existing.id },
        data: updateData
      });
    }

    const createData: any = { placa, tipo, marca: data.marca, color: data.color };
    if (parqueaderoId !== undefined) createData.parqueaderoId = parqueaderoId;

    return this.prisma.vehiculo.create({
      data: createData
    });
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
    const payload: any = { ...data };
    if (payload.parqueaderoId) payload.parqueaderoId = Number(payload.parqueaderoId);
    if (payload.placa) payload.placa = String(payload.placa).trim().toUpperCase();
    return this.prisma.vehiculo.update({ where: { id }, data: payload });
  }

  remove(id: number) {
    return this.prisma.vehiculo.delete({ where: { id } });
  }
}

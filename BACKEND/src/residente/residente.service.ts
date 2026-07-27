import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResidenteService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { apartamentoId, tipoResidente, cedula, documento, ...rest } = data;
    const docValue = documento || cedula || null;
    
    const residente = await this.prisma.residente.create({ 
      data: {
        ...rest,
        documento: docValue ? String(docValue).trim().toUpperCase() : null
      } 
    });

    if (apartamentoId && Number(apartamentoId) > 0) {
      await this.prisma.residenteApartamento.create({
        data: {
          residenteId: residente.id,
          apartamentoId: Number(apartamentoId),
          tipo: tipoResidente || 'PROPIETARIO'
        }
      });
    }

    return residente;
  }

  findAll() {
    return this.prisma.residente.findMany({
      include: { 
        usuario: { select: { email: true, id: true, rol: true } },
        apartamentos: { include: { apartamento: true } }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.residente.findUnique({ 
      where: { id },
      include: { 
        usuario: { select: { email: true, id: true } },
        apartamentos: { include: { apartamento: true } }
      }
    });
  }

  async update(id: number, data: any) {
    const { apartamentoId, tipoResidente, cedula, documento, ...rest } = data;
    const updatePayload: any = { ...rest };
    if (documento !== undefined || cedula !== undefined) {
      const docVal = documento || cedula;
      updatePayload.documento = docVal ? String(docVal).trim().toUpperCase() : null;
    }
    
    const residente = await this.prisma.residente.update({ where: { id }, data: updatePayload });

    if (apartamentoId !== undefined && apartamentoId !== null && apartamentoId !== '') {
      const targetAptoId = Number(apartamentoId);
      await this.prisma.residenteApartamento.deleteMany({
        where: { residenteId: id }
      });
      if (targetAptoId > 0) {
        await this.prisma.residenteApartamento.create({
          data: {
            residenteId: id,
            apartamentoId: targetAptoId,
            tipo: tipoResidente || 'PROPIETARIO'
          }
        });
      }
    } else if (tipoResidente) {
      await this.prisma.residenteApartamento.updateMany({
        where: { residenteId: id },
        data: { tipo: tipoResidente }
      });
    }
    return residente;
  }

  remove(id: number) {
    return this.prisma.residente.delete({ where: { id } });
  }

  async generateAccount(id: number, accountData: any) {
    const { email, password } = accountData;
    
    const residente = await this.prisma.residente.findUnique({ where: { id } });
    if (!residente) throw new BadRequestException('Residente no encontrado');
    if (residente.usuarioId) throw new BadRequestException('Este residente ya tiene una cuenta asociada');

    const existing = await this.prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) throw new BadRequestException('El correo ya está en uso');

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.usuario.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        nombre: residente.nombre,
        telefono: residente.telefono,
        rol: 'RESIDENTE',
        conjuntoId: residente.conjuntoId
      }
    });

    const updatedResidente = await this.prisma.residente.update({
      where: { id },
      data: { usuarioId: newUser.id },
      include: { usuario: { select: { email: true, id: true, rol: true } } }
    });

    return updatedResidente;
  }
}

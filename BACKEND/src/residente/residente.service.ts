import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResidenteService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { apartamentoId, tipoResidente, cedula, documento, conjuntoId, nombre, telefono } = data;
    if (!conjuntoId) {
      throw new BadRequestException('El conjuntoId es obligatorio para registrar el residente');
    }
    const cId = Number(conjuntoId);
    const docValue = (documento || cedula || '').toString().trim().toUpperCase() || null;

    let residente: any = null;

    if (docValue) {
      residente = await this.prisma.residente.findFirst({
        where: { documento: docValue }
      });
    }

    if (residente) {
      residente = await this.prisma.residente.update({
        where: { id: residente.id },
        data: {
          nombre: String(nombre || residente.nombre).trim().toUpperCase(),
          telefono: telefono !== undefined ? String(telefono).trim().toUpperCase() : residente.telefono
        }
      });
    } else {
      residente = await this.prisma.residente.create({
        data: {
          nombre: String(nombre).trim().toUpperCase(),
          documento: docValue,
          telefono: telefono ? String(telefono).trim().toUpperCase() : null,
          conjuntoId: cId
        }
      });
    }

    if (apartamentoId && Number(apartamentoId) > 0) {
      const aptoId = Number(apartamentoId);
      const existingLink = await this.prisma.residenteApartamento.findFirst({
        where: { residenteId: residente.id, apartamentoId: aptoId }
      });

      if (!existingLink) {
        await this.prisma.residenteApartamento.create({
          data: {
            residenteId: residente.id,
            apartamentoId: aptoId,
            tipo: tipoResidente || 'PROPIETARIO'
          }
        });
      } else if (tipoResidente) {
        await this.prisma.residenteApartamento.update({
          where: { id: existingLink.id },
          data: { tipo: tipoResidente }
        });
      }
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

    if (apartamentoId && Number(apartamentoId) > 0) {
      const aptoId = Number(apartamentoId);
      const existingLink = await this.prisma.residenteApartamento.findFirst({
        where: { residenteId: id, apartamentoId: aptoId }
      });
      if (!existingLink) {
        await this.prisma.residenteApartamento.create({
          data: {
            residenteId: id,
            apartamentoId: aptoId,
            tipo: tipoResidente || 'PROPIETARIO'
          }
        });
      } else if (tipoResidente) {
        await this.prisma.residenteApartamento.update({
          where: { id: existingLink.id },
          data: { tipo: tipoResidente }
        });
      }
    }

    return residente;
  }

  remove(id: number) {
    return this.prisma.residente.delete({ where: { id } });
  }

  async generateAccount(id: number, accountData: any) {
    const residente = await this.prisma.residente.findUnique({ where: { id } });
    if (!residente) throw new BadRequestException('Residente no encontrado');

    const email = accountData.email?.toLowerCase().trim();
    const password = accountData.password;

    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son requeridos');
    }

    const existingUser = await this.prisma.usuario.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('El correo ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        email,
        passwordHash: hashedPassword,
        nombre: residente.nombre,
        documento: residente.documento,
        telefono: residente.telefono,
        rol: 'RESIDENTE',
        conjuntoId: residente.conjuntoId
      }
    });

    await this.prisma.residente.update({
      where: { id },
      data: { usuarioId: usuario.id }
    });

    return usuario;
  }
}

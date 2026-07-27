import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResidenteService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { apartamentoId, tipoResidente, ...residenteData } = data;
    
    const residente = await this.prisma.residente.create({ 
      data: residenteData 
    });

    if (apartamentoId) {
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
    const { apartamentoId, tipoResidente, ...residenteData } = data;
    
    const residente = await this.prisma.residente.update({ where: { id }, data: residenteData });

    if (apartamentoId) {
      const existe = await this.prisma.residenteApartamento.findFirst({
        where: { residenteId: id, apartamentoId: Number(apartamentoId) }
      });
      if (!existe) {
        await this.prisma.residenteApartamento.create({
          data: {
            residenteId: id,
            apartamentoId: Number(apartamentoId),
            tipo: tipoResidente || 'PROPIETARIO'
          }
        });
      }
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

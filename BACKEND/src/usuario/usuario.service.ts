import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, conjuntoId: true }
    });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, rol: true, conjuntoId: true }
    });
  }

  async create(data: any) {
    const existing = await this.prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('El correo ya está en uso');

    if (!data.password) throw new BadRequestException('La contraseña es requerida');
    const passwordHash = await bcrypt.hash(data.password, 10);
    
    return this.prisma.usuario.create({
      data: {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        conjuntoId: data.conjuntoId || null,
        passwordHash
      },
      select: { id: true, nombre: true, email: true, rol: true, conjuntoId: true }
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {
      nombre: data.nombre,
      rol: data.rol,
      conjuntoId: data.conjuntoId || null,
    };

    if (data.email) updateData.email = data.email;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: { id: true, nombre: true, email: true, rol: true, conjuntoId: true }
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}

import { Module } from '@nestjs/common';
import { VehiculoService } from './vehiculo.service';
import { VehiculoController } from './vehiculo.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VehiculoController],
  providers: [VehiculoService, PrismaService],
})
export class VehiculoModule {}

import { Module } from '@nestjs/common';
import { ResidenteService } from './residente.service';
import { ResidenteController } from './residente.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ResidenteController],
  providers: [ResidenteService, PrismaService],
})
export class ResidenteModule {}

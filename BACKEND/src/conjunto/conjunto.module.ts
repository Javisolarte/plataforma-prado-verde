import { Module } from '@nestjs/common';
import { ConjuntoService } from './conjunto.service';
import { ConjuntoController } from './conjunto.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConjuntoController],
  providers: [ConjuntoService],
})
export class ConjuntoModule {}

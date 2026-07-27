import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParqueaderoController } from './parqueadero.controller';
import { ParqueaderoService } from './parqueadero.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParqueaderoController],
  providers: [ParqueaderoService]
})
export class ParqueaderoModule {}

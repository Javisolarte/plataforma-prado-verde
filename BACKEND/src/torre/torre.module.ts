import { Module } from '@nestjs/common';
import { TorreService } from './torre.service';
import { TorreController } from './torre.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TorreController],
  providers: [TorreService],
})
export class TorreModule {}

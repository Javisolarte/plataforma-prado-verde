import { Module } from '@nestjs/common';
import { VigilanciaController } from './vigilancia.controller';
import { VigilanciaService } from './vigilancia.service';

@Module({
  controllers: [VigilanciaController],
  providers: [VigilanciaService]
})
export class VigilanciaModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConjuntoModule } from './conjunto/conjunto.module';
import { TorreModule } from './torre/torre.module';
import { ApartamentoModule } from './apartamento/apartamento.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ParqueaderoModule } from './parqueadero/parqueadero.module';
import { VehiculoModule } from './vehiculo/vehiculo.module';
import { VigilanciaModule } from './vigilancia/vigilancia.module';
import { ResidenteModule } from './residente/residente.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, AuthModule, ConjuntoModule, TorreModule, ApartamentoModule, UsuarioModule, ParqueaderoModule, VehiculoModule, VigilanciaModule, ResidenteModule, SearchModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

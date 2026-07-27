import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VehiculoService } from './vehiculo.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Vehiculos')
@ApiBearerAuth()
@Controller('vehiculo')
export class VehiculoController {
  constructor(private readonly vehiculoService: VehiculoService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear vehiculo' })
  create(@Body() data: any) {
    return this.vehiculoService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar vehiculos' })
  findAll() {
    return this.vehiculoService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener vehiculo por ID' })
  findOne(@Param('id') id: string) {
    return this.vehiculoService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar vehiculo' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.vehiculoService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar vehiculo' })
  remove(@Param('id') id: string) {
    return this.vehiculoService.remove(+id);
  }
}

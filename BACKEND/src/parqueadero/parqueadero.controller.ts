import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ParqueaderoService } from './parqueadero.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Parqueaderos')
@ApiBearerAuth()
@Controller('parqueadero')
export class ParqueaderoController {
  constructor(private readonly parqueaderoService: ParqueaderoService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear parqueadero' })
  create(@Body() data: any) {
    return this.parqueaderoService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar parqueaderos' })
  findAll() {
    return this.parqueaderoService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener parqueadero por ID' })
  findOne(@Param('id') id: string) {
    return this.parqueaderoService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parqueadero' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.parqueaderoService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar parqueadero' })
  remove(@Param('id') id: string) {
    return this.parqueaderoService.remove(+id);
  }
}

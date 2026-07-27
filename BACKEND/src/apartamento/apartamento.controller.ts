import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApartamentoService } from './apartamento.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Apartamentos')
@ApiBearerAuth()
@Controller('apartamento')
export class ApartamentoController {
  constructor(private readonly apartamentoService: ApartamentoService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear apartamento' })
  create(@Body() data: any) {
    return this.apartamentoService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar apartamentos' })
  findAll() {
    return this.apartamentoService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener apartamento por ID' })
  findOne(@Param('id') id: string) {
    return this.apartamentoService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar apartamento' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.apartamentoService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar apartamento' })
  remove(@Param('id') id: string) {
    return this.apartamentoService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConjuntoService } from './conjunto.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Conjuntos')
@ApiBearerAuth()
@Controller('conjunto')
export class ConjuntoController {
  constructor(private readonly conjuntoService: ConjuntoService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear conjunto' })
  create(@Body() data: any) {
    return this.conjuntoService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get()
  @ApiOperation({ summary: 'Listar conjuntos' })
  findAll() {
    return this.conjuntoService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener conjunto por ID' })
  findOne(@Param('id') id: string) {
    return this.conjuntoService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar conjunto' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.conjuntoService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar conjunto' })
  remove(@Param('id') id: string) {
    return this.conjuntoService.remove(+id);
  }
}

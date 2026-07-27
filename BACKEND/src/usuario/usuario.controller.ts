import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  create(@Body() data: any) {
    return this.usuarioService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  findAll() {
    return this.usuarioService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.usuarioService.update(+id, data);
  }

  @Roles('SUPERUSUARIO')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}

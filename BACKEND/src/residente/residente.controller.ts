import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ResidenteService } from './residente.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Residentes')
@ApiBearerAuth()
@Controller('residente')
export class ResidenteController {
  constructor(private readonly residenteService: ResidenteService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear residente' })
  create(@Body() data: any) {
    return this.residenteService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar residentes' })
  findAll() {
    return this.residenteService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener residente por ID' })
  findOne(@Param('id') id: string) {
    return this.residenteService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar residente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.residenteService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar residente' })
  remove(@Param('id') id: string) {
    return this.residenteService.remove(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post(':id/generate-account')
  @ApiOperation({ summary: 'Generar cuenta de usuario para residente' })
  generateAccount(@Param('id') id: string, @Body() accountData: any) {
    return this.residenteService.generateAccount(+id, accountData);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TorreService } from './torre.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Torres')
@ApiBearerAuth()
@Controller('torre')
export class TorreController {
  constructor(private readonly torreService: TorreService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear torre' })
  create(@Body() data: any) {
    return this.torreService.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar torres' })
  findAll() {
    return this.torreService.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener torre por ID' })
  findOne(@Param('id') id: string) {
    return this.torreService.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar torre' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.torreService.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar torre' })
  remove(@Param('id') id: string) {
    return this.torreService.remove(+id);
  }
}

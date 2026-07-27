const fs = require('fs');
const path = require('path');

const modules = ['conjunto', 'torre', 'apartamento', 'parqueadero'];

modules.forEach(mod => {
  const modUpper = mod.charAt(0).toUpperCase() + mod.slice(1);
  const servicePath = path.join(__dirname, 'src', mod, `${mod}.service.ts`);
  const controllerPath = path.join(__dirname, 'src', mod, `${mod}.controller.ts`);

  // Fix Service
  const serviceContent = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ${modUpper}Service {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.${mod}.create({ data });
  }

  findAll() {
    return this.prisma.${mod}.findMany();
  }

  findOne(id: number) {
    return this.prisma.${mod}.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.${mod}.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.${mod}.delete({ where: { id } });
  }
}
`;
  fs.writeFileSync(servicePath, serviceContent);

  // Fix Controller
  const controllerContent = `import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ${modUpper}Service } from './${mod}.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('${modUpper}s')
@ApiBearerAuth()
@Controller('${mod}')
export class ${modUpper}Controller {
  constructor(private readonly ${mod}Service: ${modUpper}Service) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear ${mod}' })
  create(@Body() data: any) {
    return this.${mod}Service.create(data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get()
  @ApiOperation({ summary: 'Listar ${mod}s' })
  findAll() {
    return this.${mod}Service.findAll();
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener ${mod} por ID' })
  findOne(@Param('id') id: string) {
    return this.${mod}Service.findOne(+id);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ${mod}' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.${mod}Service.update(+id, data);
  }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ${mod}' })
  remove(@Param('id') id: string) {
    return this.${mod}Service.remove(+id);
  }
}
`;
  fs.writeFileSync(controllerPath, controllerContent);
});

console.log('Todos los archivos reparados correctamente');

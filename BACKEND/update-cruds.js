const fs = require('fs');
const path = require('path');

const modules = ['conjunto', 'torre', 'apartamento', 'parqueadero', 'usuario'];

modules.forEach(mod => {
  const modUpper = mod.charAt(0).toUpperCase() + mod.slice(1);
  const servicePath = path.join(__dirname, 'src', mod, `${mod}.service.ts`);
  const controllerPath = path.join(__dirname, 'src', mod, `${mod}.controller.ts`);

  // Update Service
  let serviceContent = fs.readFileSync(servicePath, 'utf8');
  if (!serviceContent.includes('update(id: number')) {
    const updateDeleteStr = `
  findOne(id: number) { return this.prisma.${mod}.findUnique({ where: { id } }); }
  update(id: number, data: any) { return this.prisma.${mod}.update({ where: { id }, data }); }
  remove(id: number) { return this.prisma.${mod}.delete({ where: { id } }); }
}
`;
    serviceContent = serviceContent.replace('}', updateDeleteStr);
    fs.writeFileSync(servicePath, serviceContent);
  }

  // Update Controller
  let controllerContent = fs.readFileSync(controllerPath, 'utf8');
  if (!controllerContent.includes('Patch(')) {
    // We need to add Param, Patch, Delete imports if they don't exist
    controllerContent = controllerContent.replace("Get, UseGuards", "Get, Patch, Delete, Param, UseGuards");
    controllerContent = controllerContent.replace("Get, UseGuards", "Get, Patch, Delete, Param, UseGuards"); // ensure
    
    // Some controllers were generated differently. Let's just blindly add missing imports
    if(!controllerContent.includes('Patch,')) {
        controllerContent = controllerContent.replace("@nestjs/common';", "Patch, Delete, Param } from '@nestjs/common';");
        controllerContent = controllerContent.replace("import { Controller, Post, Body, Get, Patch, Delete, Param } from '@nestjs/common';", "import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common';");
    }

    const controllerStr = `
  @Get(':id')
  @ApiOperation({ summary: 'Obtener ${mod} por ID' })
  findOne(@Param('id') id: string) { return this.${mod}Service.findOne(+id); }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ${mod}' })
  update(@Param('id') id: string, @Body() data: any) { return this.${mod}Service.update(+id, data); }

  @Roles('SUPERUSUARIO')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar ${mod}' })
  remove(@Param('id') id: string) { return this.${mod}Service.remove(+id); }
}
`;
    controllerContent = controllerContent.replace('}', controllerStr);
    fs.writeFileSync(controllerPath, controllerContent);
  }
});
console.log('CRUDs updated.');

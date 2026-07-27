const fs = require('fs');
const path = require('path');

const modules = ['usuario', 'torre', 'apartamento', 'parqueadero'];

modules.forEach(mod => {
  const modUpper = mod.charAt(0).toUpperCase() + mod.slice(1);
  const modulePath = path.join(__dirname, 'src', mod, `${mod}.module.ts`);

  let content = fs.readFileSync(modulePath, 'utf8');
  
  if (!content.includes('PrismaModule')) {
    content = content.replace("from '@nestjs/common';", "from '@nestjs/common';\nimport { PrismaModule } from '../prisma/prisma.module';");
    content = content.replace("controllers: [", "imports: [PrismaModule],\n  controllers: [");
    fs.writeFileSync(modulePath, content);
  }
});

console.log('Modulos reparados (PrismaModule importado)');

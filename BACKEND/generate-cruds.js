const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim() + '\n');
};

// ======================= CONJUNTO =======================
write('src/conjunto/dto/create-conjunto.dto.ts', `
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConjuntoDto {
  @ApiProperty({ example: 'Prado Verde' }) @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ example: 'Calle 123' }) @IsString() @IsNotEmpty() direccion: string;
  @ApiPropertyOptional({ example: '300123' }) @IsString() @IsOptional() telefono?: string;
}
`);

write('src/conjunto/conjunto.controller.ts', `
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ConjuntoService } from './conjunto.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Conjuntos')
@ApiBearerAuth()
@Controller('conjunto')
export class ConjuntoController {
  constructor(private readonly conjuntoService: ConjuntoService) {}

  @Roles('SUPERUSUARIO')
  @Post()
  @ApiOperation({ summary: 'Crear un conjunto (Solo Superusuario)' })
  create(@Body() dto: CreateConjuntoDto) { return this.conjuntoService.create(dto); }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Get()
  @ApiOperation({ summary: 'Listar conjuntos' })
  findAll() { return this.conjuntoService.findAll(); }
}
`);

write('src/conjunto/conjunto.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';

@Injectable()
export class ConjuntoService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateConjuntoDto) { return this.prisma.conjunto.create({ data: dto }); }
  findAll() { return this.prisma.conjunto.findMany(); }
}
`);

// ======================= TORRE =======================
write('src/torre/dto/create-torre.dto.ts', `
import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTorreDto {
  @ApiProperty({ example: 'Torre 1' }) @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() conjuntoId: number;
}
`);

write('src/torre/torre.controller.ts', `
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { TorreService } from './torre.service';
import { CreateTorreDto } from './dto/create-torre.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Torres')
@ApiBearerAuth()
@Controller('torre')
export class TorreController {
  constructor(private readonly torreService: TorreService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear una torre' })
  create(@Body() dto: CreateTorreDto) { return this.torreService.create(dto); }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar torres' })
  findAll() { return this.torreService.findAll(); }
}
`);

write('src/torre/torre.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTorreDto } from './dto/create-torre.dto';

@Injectable()
export class TorreService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateTorreDto) { return this.prisma.torre.create({ data: dto }); }
  findAll() { return this.prisma.torre.findMany(); }
}
`);

// ======================= APARTAMENTO =======================
write('src/apartamento/dto/create-apartamento.dto.ts', `
import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApartamentoDto {
  @ApiProperty({ example: '101A' }) @IsString() @IsNotEmpty() numero: string;
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() torreId: number;
}
`);

write('src/apartamento/apartamento.controller.ts', `
import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApartamentoService } from './apartamento.service';
import { CreateApartamentoDto } from './dto/create-apartamento.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Apartamentos')
@ApiBearerAuth()
@Controller('apartamento')
export class ApartamentoController {
  constructor(private readonly apartamentoService: ApartamentoService) {}

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR')
  @Post()
  @ApiOperation({ summary: 'Crear un apartamento' })
  create(@Body() dto: CreateApartamentoDto) { return this.apartamentoService.create(dto); }

  @Roles('SUPERUSUARIO', 'ADMINISTRADOR', 'VIGILANTE')
  @Get()
  @ApiOperation({ summary: 'Listar apartamentos' })
  findAll() { return this.apartamentoService.findAll(); }
}
`);

write('src/apartamento/apartamento.service.ts', `
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartamentoDto } from './dto/create-apartamento.dto';

@Injectable()
export class ApartamentoService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateApartamentoDto) { return this.prisma.apartamento.create({ data: dto }); }
  findAll() { return this.prisma.apartamento.findMany(); }
}
`);

console.log('CRUDs generados exitosamente.');

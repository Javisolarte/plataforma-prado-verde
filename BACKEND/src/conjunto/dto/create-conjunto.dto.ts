import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConjuntoDto {
  @ApiProperty({ example: 'Prado Verde' }) @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ example: 'Calle 123' }) @IsString() @IsNotEmpty() direccion: string;
  @ApiPropertyOptional({ example: '300123' }) @IsString() @IsOptional() telefono?: string;
  @ApiPropertyOptional({ example: 'Juan Perez' }) @IsString() @IsOptional() contacto?: string;
}

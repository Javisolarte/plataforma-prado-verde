import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTorreDto {
  @ApiProperty({ example: 'Torre 1' }) @IsString() @IsNotEmpty() nombre: string;
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() conjuntoId: number;
}

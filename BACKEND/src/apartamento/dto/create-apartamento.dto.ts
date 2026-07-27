import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApartamentoDto {
  @ApiProperty({ example: '101A' }) @IsString() @IsNotEmpty() numero: string;
  @ApiProperty({ example: 1 }) @IsInt() @IsNotEmpty() torreId: number;
}

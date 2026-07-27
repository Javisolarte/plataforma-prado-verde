import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterSuperDto } from './dto/register-super.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (Para cualquier rol)' })
  @ApiResponse({ status: 200, description: 'Login exitoso y devuelve token JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register-super')
  @ApiOperation({ summary: 'Registrar un primer superusuario del sistema' })
  @ApiResponse({ status: 201, description: 'Superusuario creado' })
  registerSuper(@Body() dto: RegisterSuperDto) {
    return this.authService.registerSuperusuario(dto);
  }
}

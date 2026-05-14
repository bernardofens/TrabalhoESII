import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';

@ApiTags('Users') // Agrupa lindamente no Swagger
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso. Retorna o usuário sem o passwordHash.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro de validação no body (e-mail inválido, senha curta, role fora da lista, ou campos extras com forbidNonWhitelisted).',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail já está em uso.',
    type: ErrorResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
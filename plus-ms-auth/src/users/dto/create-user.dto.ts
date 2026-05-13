import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'vendedor@loja.com' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    example: 'vendedor',
    required: false,
    description: 'Pode ser admin, gestor ou vendedor',
  })
  @IsOptional()
  @IsIn(['admin', 'gestor', 'vendedor'], {
    message: 'role deve ser admin, gestor ou vendedor',
  })
  role?: string;
}

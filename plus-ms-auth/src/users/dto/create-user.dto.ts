import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;

  @ApiProperty({ example: 'vendedor', required: false, description: 'Pode ser admin, gestor ou vendedor' })
  role?: string;
}
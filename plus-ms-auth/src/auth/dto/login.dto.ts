import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'vendedor@loja.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'O Refresh Token recebido no login' })
  @IsString()
  @IsNotEmpty({ message: 'refresh_token é obrigatório' })
  refresh_token: string;
}

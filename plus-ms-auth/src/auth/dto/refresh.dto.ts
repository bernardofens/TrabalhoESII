import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'O Refresh Token recebido no login' })
  refresh_token: string;
}
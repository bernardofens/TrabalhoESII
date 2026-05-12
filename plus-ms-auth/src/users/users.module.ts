import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Avisa que esse módulo usa a tabela User
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportamos para o futuro módulo de Login poder usar!
})
export class UsersModule {}
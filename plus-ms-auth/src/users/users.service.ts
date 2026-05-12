import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 1. Verifica se o email já existe
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    // 2. Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. Prepara o novo usuário
    const newUser = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      role: createUserDto.role || 'vendedor',
    });

    // 4. Salva no banco e retorna (escondendo a senha por segurança)
    const savedUser = await this.usersRepository.save(newUser);
    const { passwordHash, ...result } = savedUser;
    return result;
  }

  // Método auxiliar que vamos usar muito na hora do Login!
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Procura pelo ID (vamos usar na renovação do token)
  async findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  // Atualiza o Refresh Token no banco de dados (Criptografado!)
  async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersRepository.update(userId, { hashedRefreshToken });
  }

  // Remove o Refresh Token (Logout)
  async removeRefreshToken(userId: string) {
    await this.usersRepository.update(userId, { hashedRefreshToken: null });
  }
  
}
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcryptjs no nível do módulo (jest.spyOn não funciona com módulos ESM read-only)
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  const bcryptCompareMock = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updateRefreshToken: jest.fn(),
            removeRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'admin@plus.com',
      passwordHash: 'hashed-password',
      role: 'admin',
      hashedRefreshToken: null,
      isActive: true,
    };

    it('deve retornar access_token e refresh_token quando as credenciais estão corretas', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      bcryptCompareMock.mockResolvedValue(true as never);
      jwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');

      const result = await service.login({
        email: 'admin@plus.com',
        password: 'senha123',
      });

      expect(result).toEqual({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        'uuid-123',
        'mock-refresh-token',
      );
    });

    it('deve lançar UnauthorizedException quando o usuário não existe', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inexistente@plus.com', password: 'qualquer' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });

    it('deve lançar UnauthorizedException quando a senha está incorreta', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      bcryptCompareMock.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'admin@plus.com', password: 'senha-errada' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('deve lançar ForbiddenException quando o refresh token não bate com o hash do banco', async () => {
      usersService.findById.mockResolvedValue({
        id: 'uuid-123',
        email: 'admin@plus.com',
        passwordHash: 'hash',
        role: 'admin',
        hashedRefreshToken: 'hash-do-refresh-original',
        isActive: true,
      } as any);
      bcryptCompareMock.mockResolvedValue(false as never);

      await expect(
        service.refreshTokens('uuid-123', 'refresh-token-adulterado'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('deve remover o refresh token do banco', async () => {
      await service.logout('uuid-123');

      expect(usersService.removeRefreshToken).toHaveBeenCalledWith('uuid-123');
    });
  });
});
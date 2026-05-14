import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        hashedRefreshToken: string | null;
        role: string;
        isActive: boolean;
    }>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
    removeRefreshToken(userId: string): Promise<void>;
}

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    refreshTokens(req: any, refreshDto: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    introspect(req: any): {
        active: boolean;
        user: any;
    };
    testRbac(req: any): {
        message: string;
        user: any;
    };
}

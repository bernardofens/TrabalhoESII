export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    hashedRefreshToken: string | null;
    role: string;
    isActive: boolean;
}

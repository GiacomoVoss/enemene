import { AbstractUser } from "..";
export declare class AuthService {
    static PRIVATE_KEY: any;
    static PUBLIC_KEY: any;
    static authenticate(auth: string): Promise<AbstractUser | undefined>;
    static sign(payload: any): string;
}

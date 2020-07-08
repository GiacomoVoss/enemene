export default class AuthRouter {
    login(username: string, password: string): Promise<string>;
    getPublicKey(): Promise<string>;
}

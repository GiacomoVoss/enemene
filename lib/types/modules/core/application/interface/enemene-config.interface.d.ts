import { LogLevel } from "../../log";
import { AbstractUser } from "../../auth";
export interface EnemeneConfig {
    url: string;
    logLevel: LogLevel;
    logPath: string;
    port: string;
    db: {
        host: string;
        database: string;
        port: string;
        username: string;
        password: string;
    };
    userModel: typeof AbstractUser;
}

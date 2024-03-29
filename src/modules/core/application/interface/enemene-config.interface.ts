import {LogLevel} from "../../log";
import {AbstractUser} from "../../auth";
import {uuid} from "../../../../base/type/uuid.type";

export interface EnemeneConfig {
    /**
     * The URL at which the server will be available.
     */
    url: string;

    /**
     * The port on which the server should listen.
     */
    port: string;

    /**
     * The path where all modules like services, controllers and views are.
     */
    modulesPath: string;

    /**
     * The log level to show in the log.
     */
    logLevel: LogLevel;

    /**
     * The path where log files should be created in.
     */
    logPath: string;

    /**
     * The path where data files like file uploads should be created in.
     */
    dataPath: string;

    /**
     * Database connection configuration.
     */
    db: {
        /**
         * The database host.
         */
        host: string;

        /**
         * The database schema.
         */
        database: string;

        /**
         * The database port.
         */
        port: string;

        /**
         * The database username.
         */
        username: string;

        /**
         * The database password.
         */
        password: string;
    }

    security?: {
        jwtPrivateKeyPath: string;
        jwtPublicKeyPath: string;
    }

    ssl?: {
        sslCertPath: string;
        sslKeyPath: string;
        sslPassphrase?: string;
    }

    userModel: typeof AbstractUser;

    languages?: string[];

    /**
     * The ID of a developer role which automatically gets permission to all views, controllers and actions.
     */
    developerRoleId?: uuid;

    /**
     * The ID of an anonymous role which will be assigned automatically to all non-authenticated requests.
     */
    anonymousRoleId?: uuid;

    /**
     * This can contain 2 possible values:
     * 1. a url starting with http/https to a running server, which will be proxied through the enemene server.
     * 2. a file path to the folder where the static frontend files and an index.html file live.
     * Both will be delivered for any request not starting with "/api".
     */
    frontend?: string;

    /**
     * Activate CORS functionality.
     */
    cors: boolean;

    /**
     * Define the allowed origin URLs for CORS.
     */
    allowedOrigins?: string[];
}

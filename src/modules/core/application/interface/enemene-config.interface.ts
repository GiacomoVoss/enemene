import {LogLevel} from "../../log";
import {AbstractUser} from "../../auth";

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
     * The log level to show in the log.
     */
    logLevel: LogLevel;

    /**
     * The path where log files should be created in.
     */
    logPath: string;

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

    /**
     * This can contain 2 possible values:
     * 1. a url starting with http/https to a running server, which will be proxied through the enemene server.
     * 2. a file path to the folder where the static frontend files and an index.html file live.
     * Both will be delivered for any request not starting with "/api".
     */
    frontend?: string;
}

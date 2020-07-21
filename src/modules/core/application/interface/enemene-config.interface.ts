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

    userModel: typeof AbstractUser;

    /**
     * An optional URL which will be proxied for all requests that don't start with "/api".
     */
    proxyFor?: string;
}

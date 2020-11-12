import {AbstractUser} from "./auth";
import {ConstructorOf, uuid} from "./base";
import {LogLevel, LogService} from "./log";
import {RequestContext} from "./controller";
import {Sequelize} from "sequelize-typescript";

/**
 * Enemene's main class.
 */
export declare class Enemene {
    /**
     * This attribute holds the singleton instance of the {@link Enemene} application.
     */
    public static app: Enemene;

    /**
     * Use this to send messages to the log.
     */
    public static log: LogService;

    /**
     * The raw database connection with sequelize.
     */
    public db: Sequelize;

    /**
     * A boolean to determine if the application is currently in dev mode (controlled by NODE_ENV === "development")
     */
    public devMode: boolean;

    /**
     * The configuration of the application.
     */
    public config: EnemeneConfig;

    /**
     * Creates an application instance.
     * @param config {EnemeneConfig} The application configuration.
     */
    public static create(config: EnemeneConfig): Promise<Enemene>;

    /**
     * Start the application.
     */
    public start(): void;

    /**
     * Drops and recreates the database and imports new data based on the provided yaml fixtures.
     * @param config {EnemeneConfig} The application configuration.
     * @param fixturesPaths {string[]} Paths to the directories where fixture files lie. Will be imported in the parameter order.
     */
    public static importDatabase(config: EnemeneConfig, ...fixturesPaths: string[]): Promise<void>;

    /**
     * Inject a service. Enemene will create a singleton instance of the service if it doesn't exist yet and return the instance.
     * @param serviceClass {ConstructorOf<SERVICE>} Class of the service to create/inject.
     */
    public inject<SERVICE>(serviceClass: ConstructorOf<SERVICE>): SERVICE;
}

export declare interface EnemeneConfig {
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

    /**
     * Security options.
     */
    security?: {
        /**
         * File path to the private key used for JWT.
         */
        jwtPrivateKeyPath: string;

        /**
         * File path to the public key used for JWT.
         */
        jwtPublicKeyPath: string;
    }

    /**
     * SSL configuration.
     */
    ssl?: {
        sslCertPath: string;
        sslKeyPath: string;
        sslPassphrase?: string;
    }

    /**
     * The model used as a User identification.
     */
    userModel: typeof AbstractUser;

    /**
     * The supported languages as an array of strings, ordered by usage priority.
     * @example ["de", "en"]
     */
    languages?: string[];

    /**
     * The ID of a developer role which automatically gets permission to all views, controllers and actions.
     */
    developerRoleId?: uuid;

    /**
     * This can contain 2 possible values:
     * 1. a url starting with http/https to a running server, which will be proxied through the enemene server.
     * 2. a file path to the folder where the static frontend files and an index.html file live.
     * Both will be delivered for any request not starting with "/api".
     */
    frontend?: string;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff before a new object of the class is created.
 */
export declare interface BeforeCreateHook {
    onBeforeCreate(context: RequestContext<AbstractUser>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff after a new object of the class was created.
 */
export declare interface AfterCreateHook {
    onAfterCreate(context: RequestContext<AbstractUser>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff before an object of the class is deleted.
 */
export declare interface BeforeDeleteHook {
    onBeforeDelete(context: RequestContext<AbstractUser>): Promise<void>;
}

export interface LifecycleHook {
    onStart?(): Promise<void>;
}

import {LogService} from "../log";
import {Sequelize} from "sequelize";
import {ConstructorOf} from "../base";
import {EnemeneConfig} from "../application";

export declare class EnemeneCqrs {
    /**
     * This attribute holds the singleton instance of the {@link Enemene} application.
     */
    public static app: EnemeneCqrs;

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
    public static create(config: EnemeneConfig): Promise<EnemeneCqrs>;

    /**
     * Start the application.
     */
    public start(): void;

    /**
     * Inject a service. Enemene will create a singleton instance of the service if it doesn't exist yet and return the instance.
     * @param serviceClass {ConstructorOf<SERVICE>} Class of the service to create/inject.
     */
    public inject<SERVICE>(serviceClass: ConstructorOf<SERVICE>): SERVICE;
}
import {EnemeneConfig} from "./interface/enemene-config.interface";
import {Enemene} from "./enemene";
import {RouterService} from "../router/service/router.service";
import {DocumentController} from "../document/document.controller";
import {FileController} from "../file/file.controller";
import {DataTypes, Model} from "sequelize";
import {CommandController} from "../cqrs/controller/command.controller";
import {LogService} from "../log/service/log.service";
import {AggregateRegistryService, Event, EventRepositoryService, ReadController, ReadModelRepositoryService} from "../cqrs";
import {ReadModelRegistryService} from "../cqrs/service/read-model-registry.service";
import {EventRegistryService} from "../cqrs/service/event-registry.service";
import {CommandRegistryService} from "../cqrs/service/command-registry.service";
import {AuthService} from "../auth/service/auth.service";
import {ConstructorOf} from "../../../base/constructor-of";
import {AbstractUserReadModel} from "../auth/interface/abstract-user-read-model.interface";
import AuthCqrsController from "../auth/auth-cqrs.controller";
import {Snapshot} from "../cqrs/entity/snapshot.model";
import {SagaRepositoryService} from "../cqrs/service/saga-repository.service";

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class EnemeneCqrs extends Enemene {

    public static app: EnemeneCqrs;

    public static async create(config: EnemeneConfig): Promise<EnemeneCqrs> {
        Enemene.log = new LogService(config.logLevel, config.logPath);
        EnemeneCqrs.app = new EnemeneCqrs(config);
        Enemene.app = EnemeneCqrs.app as unknown as Enemene;
        await EnemeneCqrs.app.setup();
        return EnemeneCqrs.app;
    }

    protected initializeDatabase(config: EnemeneConfig): void {
        super.initializeDatabase(config);
        Event.init({
            position: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                primaryKey: true,
                autoIncrement: true,
            },
            id: {
                type: DataTypes.STRING(36),
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            correlation_id: {
                type: DataTypes.STRING(36),
            },
            causation_id: {
                type: DataTypes.STRING(36),
            },
            caused_by_user_id: {
                type: DataTypes.STRING(36),
            },
            eventType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            aggregateId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            data: {
                type: DataTypes.JSON,
                allowNull: true,
                get: function (this: Model) {
                    const value = this.getDataValue("data") as any;
                    if (value === undefined || value === null) {
                        return value;
                    }
                    if (typeof value === "string") {
                        return JSON.parse(value);
                    }
                    return value;
                },
                set: function (this: Model, value: string) {
                    this.setDataValue("data", value as any);
                }
            }
        }, {
            sequelize: this.db,
            modelName: "Event",
            tableName: "event",
            updatedAt: false,
        });

        Snapshot.init({
            id: {
                type: DataTypes.STRING(36),
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            position: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            data: {
                type: DataTypes.JSON,
                allowNull: true,
                get: function (this: Model) {
                    const value = this.getDataValue("data") as any;
                    if (value === undefined || value === null) {
                        return value;
                    }
                    if (typeof value === "string") {
                        return JSON.parse(value);
                    }
                    return value;
                },
                set: function (this: Model, value: string) {
                    this.setDataValue("data", value as any);
                }
            }
        }, {
            sequelize: this.db,
            modelName: "Snapshot",
            tableName: "snapshot",
            updatedAt: false,
        });
    }

    public async start(): Promise<void> {
        await this.inject(EventRepositoryService).startEventListener();
        await super.start();
    }

    public async setup(): Promise<void> {
        await this.db.authenticate();
        await this.db.sync({
            alter: true,
        });
        await this.setupServices();
        await EnemeneCqrs.app.inject(AggregateRegistryService).init();
        await EnemeneCqrs.app.inject(ReadModelRegistryService).init();
        await EnemeneCqrs.app.inject(EventRegistryService).init();
        await EnemeneCqrs.app.inject(ReadModelRepositoryService).init();
        await EnemeneCqrs.app.inject(CommandRegistryService).init();
        await EnemeneCqrs.app.inject(SagaRepositoryService).init();
        if (Enemene.app.config.security) {
            AuthService.initCqrs(Enemene.app.config.security.jwtPublicKeyPath, Enemene.app.config.security.jwtPrivateKeyPath, Enemene.app.config.userModel as ConstructorOf<AbstractUserReadModel>);
        }
        this.routerService = this.inject(RouterService);
        await this.setupControllers([
            AuthCqrsController,
            ReadController,
            CommandController,
            DocumentController,
            FileController,
        ]);
    }
}

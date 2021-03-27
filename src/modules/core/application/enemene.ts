import {allowHeaders} from "../middleware/allow-headers.middleware";
import proxy from "express-http-proxy";
import {RouterService} from "../router/service/router.service";
import express, {NextFunction, Request, Response} from "express";
import path from "path";
import {EnemeneConfig} from "./interface/enemene-config.interface";
import {Sequelize} from "sequelize";
import {DbImport} from "./bin/db-import";
import {Dictionary} from "../../../base/type/dictionary.type";
import {PermissionService} from "../auth/service/permission.service";
import {LogService} from "../log/service/log.service";
import {ActionService} from "../action/service/action.service";
import https from "https";
import * as fs from "fs";
import {ConstructorOf} from "../../../base/constructor-of";
import {FileService} from "../file/service/file.service";
import {ModelService} from "../model/service/model.service";
import {ViewInitializerService} from "../view";
import {AbstractController, UnrestrictedRequestContext} from "../router";
import {MigrationService} from "../migration/service/migration.service";
import AuthController from "../auth/auth.controller";
import ActionController from "../action/action.controller";
import {DocumentController} from "../document/document.controller";
import {FileController} from "../file/file.controller";
import ViewGetController from "../view/view-get.controller";
import ViewPostController from "../view/view-post.controller";
import ViewPutController from "../view/view-put.controller";
import ViewDeleteController from "../view/view-delete.controller";
import {ModelController} from "../model/model.controller";
import {AuthService} from "../auth/service/auth.service";
import {AbstractUser} from "../auth";
import bodyParser = require("body-parser");

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class Enemene {

    public static systemModels: Promise<any>[] = [
        import("../view/model/view-object.model"),
        import("../auth/model/role.model"),
        import("../auth/model/route-permission.model"),
        import("../auth/model/view-permission.model"),
        import("../file/model/file.model"),
        import("../migration/model/migration.model"),
    ];

    public static app: Enemene;

    public static log: LogService;
    public log: LogService;
    public db: Sequelize;
    public devMode: boolean;
    protected express: express.Application;
    protected services: Dictionary<any> = {};
    protected routerService: RouterService;

    constructor(public config: EnemeneConfig) {
        this.express = express();
        this.devMode = process.env.NODE_ENV === "development";
        this.express.use(allowHeaders);
        this.express.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
        this.express.use(bodyParser.json({limit: "50mb"}));
        this.log = Enemene.log;
        this.log[config.logLevel.toLowerCase()]("Server", "Log level: " + config.logLevel.toUpperCase());
        this.config.port = `${this.normalizePort(config.port)}`;
        this.initializeDatabase(config);

        UnrestrictedRequestContext.$userModel = config.userModel as ConstructorOf<AbstractUser>;
        UnrestrictedRequestContext.$db = this.db;
    }

    protected initializeDatabase(config: EnemeneConfig): void {
        this.db = new Sequelize({
            host: config.db.host,
            port: this.normalizePort(config.db.port),
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            dialect: "mysql",
            dialectOptions: {
                multipleStatements: true,
            },
            logging: sql => Enemene.log.silly("Database", sql),
        });
    }

    public static async create(config: EnemeneConfig): Promise<Enemene> {
        Enemene.log = new LogService(config.logLevel, config.logPath);
        Enemene.app = new Enemene(config);
        await Enemene.app.setup();
        return Enemene.app;
    }

    /**
     * Import database from fixtures and terminate.
     */
    public static async importDatabase(config: EnemeneConfig, ...fixturesPaths: string[]): Promise<void> {
        Enemene.log = new LogService(config.logLevel, config.logPath);
        const app: Enemene = new Enemene(config);
        await app.inject(ModelService).init(app, Enemene.systemModels);
        await new DbImport(app.db, fixturesPaths).resetAndImportDb();
    }

    public async start(): Promise<void> {
        if (this.config.ssl) {
            this.express.use((req: Request, res: Response, next: NextFunction) => {
                if (req.secure) {
                    // request was via https, so do no special handling
                    next();
                } else {
                    // request was via http, so redirect to https
                    res.redirect("https://" + req.headers.host + req.url);
                }
            });
            https.createServer({
                    key: fs.readFileSync(this.config.ssl.sslKeyPath),
                    cert: fs.readFileSync(this.config.ssl.sslCertPath),
                    passphrase: this.config.ssl.sslPassphrase,
                },
                this.express
            ).listen(this.config.port, () => {
                Enemene.log.info("Server", "Listening on port: " + this.config.port);
            });
        } else {
            this.express.listen(this.config.port, () => {
                Enemene.log.info("Server", "Listening on port: " + this.config.port);
            });
        }
    }

    public inject<SERVICE>(serviceClass: new () => SERVICE): SERVICE {
        if (!this.services[serviceClass.name]) {
            Enemene.log.debug("Server", "Creating singleton service instance of " + serviceClass.name);
            this.services[serviceClass.name] = new serviceClass();
            if (this.services[serviceClass.name].onStart) {
                this.services[serviceClass.name].onStart();
            }
        }
        return this.services[serviceClass.name];
    }

    public async setup(): Promise<void> {
        await this.inject(ModelService).init(this, Enemene.systemModels);
        if (Enemene.app.config.security) {
            AuthService.init(Enemene.app.config.security.jwtPublicKeyPath, Enemene.app.config.security.jwtPrivateKeyPath, Enemene.app.config.userModel as typeof AbstractUser);
        }
        const migrationSuccess: boolean = await (new MigrationService(new FileService(), Enemene.log, Enemene.app.db)).execute();
        if (!migrationSuccess) {
            process.exit(1);
        }
        await this.setupServices();
        this.routerService = this.inject(RouterService);
        await this.setupControllers([AuthController,
            ActionController,
            DocumentController,
            FileController,
            ViewGetController,
            ViewPostController,
            ViewPutController,
            ViewDeleteController,
            ModelController,
        ]);
        await this.setupViews();
        await this.setupActions();
        await this.inject(PermissionService).buildCache();
    }

    protected async setupControllers(systemControllers: ConstructorOf<AbstractController>[]): Promise<void> {
        await this.routerService.init(systemControllers);

        if (this.config.frontend) {
            if (this.config.frontend.startsWith("http://") || this.config.frontend.startsWith("https://")) {
                this.express.use("/", proxy(this.config.frontend, {
                    filter: (req) => {
                        return !req.path.startsWith("/api");
                    }
                }));
                this.routerService.loadPaths(this.express);
                Enemene.log.info("Server", `Proxying frontend "${this.config.frontend}".`);
            } else {
                this.express.use("/", express.static(this.config.frontend));
                this.routerService.loadPaths(this.express);
                this.express.get("/*", (req, res) => {
                    res.sendFile(path.join(this.config.frontend, "index.html"));
                });
                Enemene.log.info("Server", `Delivering frontend from "${this.config.frontend}".`);
            }
        }
    }

    protected async setupViews(): Promise<void> {
        return Enemene.app.inject(ViewInitializerService).init();
    }

    protected async setupActions(): Promise<void> {
        await this.inject(ActionService).init();
    }

    protected async setupServices(): Promise<void> {
        FileService.DATA_PATH = this.config.dataPath;
        const serviceFiles: string[] = this.inject(FileService).scanForFilePattern(Enemene.app.config.modulesPath, /.*\.service\.js/);
        const serviceModules: Dictionary<ConstructorOf<Function>>[] = await Promise.all(serviceFiles.map((filePath: string) => import(filePath)));
        serviceModules.forEach((moduleMap: Dictionary<ConstructorOf<Function>>) => {
            Object.values(moduleMap)
                .filter((module: ConstructorOf<Function>) => !!module.prototype)
                .forEach((module: ConstructorOf<Function>) => {
                    Enemene.log.debug("Server", "Registering service " + module.name);
                    if (module.prototype.onStart) {
                        this.services[module.name] = new module();
                        this.services[module.name].onStart();
                    }
                });
        });
    }

    protected normalizePort(val: number | string): number {
        const port: number = (typeof val === "string") ? parseInt(val, 10) : val;
        if (isNaN(port)) {
            return null;
        } else if (port >= 0) {
            return port;
        } else {
            return null;
        }
    }
}

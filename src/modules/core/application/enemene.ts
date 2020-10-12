import {allowHeaders} from "../middleware/allow-headers.middleware";
import proxy from "express-http-proxy";
import {RouterService} from "../router/service/router.service";
import express, {NextFunction, Request, Response} from "express";
import path from "path";
import {ViewService} from "../view";
import {EnemeneConfig} from "./interface/enemene-config.interface";
import {Sequelize} from "sequelize-typescript";
import {DbImport} from "./bin/db-import";
import ViewGetController from "../view/view-get.controller";
import ViewPostController from "../view/view-post.controller";
import ViewDeleteController from "../view/view-delete.controller";
import AuthController from "../auth/auth.controller";
import {ModelController} from "../model/model.controller";
import {Dictionary} from "../../../base/type/dictionary.type";
import {PathDefinition} from "../auth/interface/path-definition.interface";
import {PermissionService} from "../auth/service/permission.service";
import chalk from "chalk";
import {LogService} from "../log/service/log.service";
import {AbstractAction} from "../action/class/abstract-action.class";
import {ActionService} from "../action/service/action.service";
import ActionController from "../action/action.controller";
import {AuthService} from "../auth/service/auth.service";
import https from "https";
import * as fs from "fs";
import ViewPutController from "../view/view-put.controller";
import {Role, RoutePermission, ViewPermission} from "../auth";
import {ConstructorOf} from "../../../base/constructor-of";
import {AbstractController} from "../router/class/abstract-controller.class";
import {View} from "../view/class/view.class";
import bodyParser = require("body-parser");

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class Enemene {

    public static app: Enemene;

    public static log: LogService;
    public express: express.Application;
    public db: Sequelize;
    public devMode: boolean;
    private services: Dictionary<any> = {};
    private routerService: RouterService;

    constructor(public config: EnemeneConfig) {
        this.express = express();
        this.devMode = process.env.NODE_ENV === "development";
        this.express.use(allowHeaders);
        this.express.use(bodyParser.json());
        Enemene.log[config.logLevel.toLowerCase()]("Server", "Log level: " + config.logLevel.toUpperCase());
        this.config.port = `${this.normalizePort(config.port)}`;

        this.db = new Sequelize({
            host: config.db.host,
            port: this.normalizePort(config.db.port),
            username: config.db.username,
            password: config.db.password,
            database: config.db.database,
            dialect: "mysql",
            timezone: "+02:00",
            modelPaths: [
                process.cwd() + "/**/*.model.js",
            ],
            models: [
                Role,
                RoutePermission,
                ViewPermission,
            ],
            modelMatch: (filename, member) => {
                const kebab: string[] = filename.substring(0, filename.indexOf(".model")).split("-");
                const camel: string = kebab.map((chunk: string) =>
                    chunk.substr(0, 1).toUpperCase() + chunk.substr(1).toLowerCase()
                ).join("");
                Enemene.log.debug("Database", `Registering model ${chalk.bold(camel)}.`);
                return camel === member;
            },
            logging: sql => Enemene.log.debug("Database", sql),
        });

        if (this.config.security) {
            AuthService.init(this.config.userModel, this.config.security.jwtPublicKeyPath, this.config.security.jwtPrivateKeyPath);
        }

    }

    public static async create(config: EnemeneConfig): Promise<Enemene> {
        Enemene.log = new LogService(config.logLevel, config.logPath);
        Enemene.app = new Enemene(config);
        await Enemene.app.db.authenticate();
        return Enemene.app;
    }

    public getSingleton<ENTITY>(clazz: new () => ENTITY): ENTITY {
        return this.services[clazz.name];
    }

    /**
     * Import database from fixtures and terminate.
     */
    public async importDatabase(fixturesPath: string): Promise<void> {
        await new DbImport(this.db, fixturesPath).resetAndImportDb();
    }

    public async setup(controllers: Dictionary<Function>,
                       views: Dictionary<ConstructorOf<View<any>>>,
                       actions?: Dictionary<typeof AbstractAction>,
                       services?: Dictionary<Function>): Promise<void> {
        if (services) {
            await this.setupServices(services);
        }
        this.routerService = this.inject(RouterService);
        await this.setupControllers({
            ...controllers,
            AuthController,
            ActionController,
            ViewGetController,
            ViewPostController,
            ViewPutController,
            ViewDeleteController,
            ModelController,
        });
        await this.setupViews(views);
        if (actions) {
            await this.setupActions(actions);
        }
        await this.inject(PermissionService).buildCache();
    }

    public start(): void {
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

    private async setupControllers(routers: Dictionary<ConstructorOf<AbstractController>>): Promise<void> {
        Object.values(routers)
            .filter((router: ConstructorOf<AbstractController>) => !!router.prototype.$modulePath)
            .forEach((router: ConstructorOf<AbstractController>) => {
                (router.prototype.$paths || []).forEach((pathDefinition: PathDefinition) => {
                    this.routerService.register(router, pathDefinition);
                });
            });

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

    private async setupViews(views: Dictionary<ConstructorOf<View<any>>>): Promise<void> {
        await this.inject(ViewService).init(views);
    }

    private async setupActions(actions: Dictionary<Function>): Promise<void> {
        await this.inject(ActionService).init(actions);
    }

    private async setupServices(services: Dictionary<Function>): Promise<void> {
        for (const name in services) {
            if (services.hasOwnProperty(name)) {
                const serviceClass = services[name] as any;
                Enemene.log.debug("Server", "Registering service " + name);
                if (serviceClass.prototype.onStart) {
                    this.services[name] = new serviceClass();
                    this.services[name].onStart();
                }
            }
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

    private normalizePort(val: number | string): number {
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

import {allowHeaders} from "../middleware/allow-headers.middleware";
import proxy from "express-http-proxy";
import {RouterService} from "../router/service/router.service";
import express, {NextFunction, Request, Response} from "express";
import path from "path";
import {View, ViewService} from "../view";
import {EnemeneConfig} from "./interface/enemene-config.interface";
import {Sequelize} from "sequelize-typescript";
import {DbImport} from "./bin/db-import";
import ViewGetRouter from "../view/view-get.router";
import ViewPostRouter from "../view/view-post.router";
import ViewDeleteRouter from "../view/view-delete.router";
import AuthRouter from "../auth/auth.router";
import {ModelRouter} from "../model/model.router";
import {Dictionary} from "../../../base/type/dictionary.type";
import {PathDefinition} from "../auth/interface/path-definition.interface";
import {PermissionService} from "../auth/service/permission.service";
import chalk from "chalk";
import {LogService} from "../log/service/log.service";
import {AbstractAction} from "../action/class/abstract-action.class";
import {ActionService} from "../action/service/action.service";
import ActionRouter from "../action/action.router";
import {AuthService} from "../auth/service/auth.service";
import https, {Server} from "https";
import * as fs from "fs";
import ViewPutRouter from "../view/view-put.router";
import bodyParser = require("body-parser");

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class Enemene {

    public static app: Enemene;

    public static log: LogService;

    private services: Dictionary<any> = {};

    public express: express.Application;

    public db: Sequelize;

    public devMode: boolean;

    constructor(public config: EnemeneConfig) {
        this.express = express();
        this.devMode = process.env.NODE_ENV === "development";
        this.express.use(allowHeaders);
        this.express.use(bodyParser.json());
        Enemene.log[config.logLevel.toLowerCase()]("Server", "Log level: " + config.logLevel.toUpperCase());
        if (this.config.security) {
            AuthService.init(this.config.security.jwtPublicKeyPath, this.config.security.jwtPrivateKeyPath);
        }

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
                __dirname + "/../**/*.model.js",
                process.cwd() + "/**/*.model.js",
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
        process.exit(0);
    }

    public async setup(routers: Dictionary<Function>,
                       views: Dictionary<View<any>>,
                       actions?: Dictionary<typeof AbstractAction>,
                       services?: Dictionary<Function>): Promise<void> {
        await this.setupRouters({
            ...routers,
            AuthRouter,
            ActionRouter,
            ViewGetRouter,
            ViewPostRouter,
            ViewPutRouter,
            ViewDeleteRouter,
            ModelRouter,
        });
        await this.setupViews(views);
        if (actions) {
            await this.setupActions(actions);
        }
        if (services) {
            await this.setupServices(services);
        }
        await PermissionService.buildCache();
    }

    private async setupRouters(routers: Dictionary<Function>): Promise<void> {
        Object.values(routers)
            .filter((router: Function) => !!router.prototype.$modulePath)
            .forEach((router: Function) => {
                (router.prototype.$paths || []).forEach((pathDefinition: PathDefinition) => {
                    RouterService.register(router.prototype.$modulePath, pathDefinition);
                });
            });

        if (this.config.frontend) {
            if (this.config.frontend.startsWith("http://") || this.config.frontend.startsWith("https://")) {
                this.express.use("/", proxy(this.config.frontend, {
                    filter: (req) => {
                        return !req.path.startsWith("/api");
                    }
                }));
                RouterService.loadPaths(this.express);
                Enemene.log.info("Server", `Proxying frontend "${this.config.frontend}".`);
            } else {
                this.express.use("/", express.static(this.config.frontend));
                RouterService.loadPaths(this.express);
                this.express.get("/*", (req, res) => {
                    res.sendFile(path.join(this.config.frontend, "index.html"));
                });
                Enemene.log.info("Server", `Delivering frontend from "${this.config.frontend}".`);
            }
        }
    }

    private async setupViews(views: Dictionary<View<any>>): Promise<void> {
        await ViewService.init(views);
    }

    private async setupActions(actions: Dictionary<typeof AbstractAction>): Promise<void> {
        await ActionService.init(actions);
    }

    private async setupServices(services: Dictionary<Function>): Promise<void> {
        for (const name in services) {
            if (services.hasOwnProperty(name)) {
                const serviceClass = services[name] as any;
                const instance = new serviceClass();
                this.services[name] = instance;
                Enemene.log.info("Server", "Registering singleton service " + name);
                if (instance.onStart) {
                    await instance.onStart();
                }
            }
        }
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

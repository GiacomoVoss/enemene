import {allowHeaders} from "../middleware/allow-headers.middleware";
import proxy from "express-http-proxy";
import {RouterService} from "../router/service/router.service";
import express from "express";
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
import bodyParser = require("body-parser");

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class Enemene {

    public static app: Enemene;

    public static log: LogService;

    public server: express.Application;

    public db: Sequelize;

    public devMode: boolean;

    constructor(public config: EnemeneConfig) {
        this.server = express();
        this.devMode = process.env.NODE_ENV === "development";
        this.server.use(allowHeaders);
        this.server.use(bodyParser.json());
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
                __dirname + "/../**/*.model.js",
                process.cwd() + "/dist/**/*.model.js",
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

    /**
     * Import database from fixtures and terminate.
     */
    public async importDatabase(fixturesPath: string): Promise<void> {
        await new DbImport(this.db, fixturesPath).resetAndImportDb();
        process.exit(0);
    }

    public async setup(routers: Dictionary<Function>, views: Dictionary<View<any>>, actions: Dictionary<typeof AbstractAction>): Promise<void> {
        await this.setupRouters({
            ...routers,
            AuthRouter,
            ActionRouter,
            ViewGetRouter,
            ViewPostRouter,
            ViewDeleteRouter,
            ModelRouter,
        });
        await this.setupViews(views);
        await this.setupActions(actions);
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

        if (this.config.proxyFor) {
            this.server.use("/", proxy(this.config.proxyFor, {
                filter: (req) => {
                    return !req.path.startsWith("/api");
                }
            }));
            Enemene.log.info("Server", `Proxying "${this.config.proxyFor}".`);
            RouterService.loadPaths(this.server);
        } else {
            this.server.use("/", express.static(path.join(__dirname, "..", "frontend", "dist")));
            RouterService.loadPaths(this.server);
            this.server.get("/*", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
            });
        }
    }

    private async setupViews(views: Dictionary<View<any>>): Promise<void> {
        await ViewService.init(views);
    }

    private async setupActions(actions: Dictionary<typeof AbstractAction>): Promise<void> {
        await ActionService.init(actions);
    }

    public start(): void {
        this.server.listen(this.config.port, () => {
            Enemene.log.info("Server", "Listening on port: " + this.config.port);
        });
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

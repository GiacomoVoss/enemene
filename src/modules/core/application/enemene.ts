import {Server} from "@overnightjs/core";
import {allowHeaders} from "../middleware/allow-headers.middleware";
import {PermissionService} from "../auth";
import proxy from "express-http-proxy";
import {RouterService} from "../router/service/router.service";
import * as express from "express";
import path from "path";
import {View, ViewService} from "../view";
import {EnemeneConfig} from "./interface/enemene-config.interface";
import {Sequelize} from "sequelize-typescript";
import {LogService} from "../log";
import {DbImport} from "./bin/db-import";
import ViewGetRouter from "../view/view-get.router";
import ViewPostRouter from "../view/view-post.router";
import ViewDeleteRouter from "../view/view-delete.router";
import AuthRouter from "../auth/auth.router";
import {ModelRouter} from "../model/model.router";
import {Dictionary} from "../../../base/type/dictionary.type";
import {PathDefinition} from "../auth/interface/path-definition.interface";
import bodyParser = require("body-parser");

require("express-async-errors");

export {EnemeneConfig} from "./interface/enemene-config.interface";

export class Enemene extends Server {

    public static app: Enemene;

    public db: Sequelize;

    public devMode: boolean;

    private importDb: boolean;

    constructor(public config: EnemeneConfig) {
        super(process.env.NODE_ENV === "development"); // setting showLogs to true
        this.devMode = process.env.NODE_ENV === "development";
        LogService.createLogger(config.logLevel, config.logPath);
        this.app.use(allowHeaders);
        this.app.use(bodyParser.json());
        LogService.log[config.logLevel.toLowerCase()]("Log level: " + config.logLevel.toUpperCase());

        this.config.port = `${this.normalizePort(config.port)}`;
        this.importDb = process.argv[2] === "import";

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
                return camel === member;
            },
            logging: sql => LogService.log.debug(sql),
        });
    }

    public static async create(config: EnemeneConfig): Promise<Enemene> {
        Enemene.app = new Enemene(config);
        await Enemene.app.db.authenticate();
        if (Enemene.app.importDb) {
            // Just import DB and teminate.
            await new DbImport(Enemene.app.db).resetAndImportDb();
            process.exit(0);
        }
        return Enemene.app;
    }

    public async setup(routers: Dictionary<Function>, views: Dictionary<View<any>>): Promise<void> {
        await this.setupRouters({
            ...routers,
            AuthRouter,
            ViewGetRouter,
            ViewPostRouter,
            ViewDeleteRouter,
            ModelRouter,
        });
        await this.setupViews(views);
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

        if (this.showLogs) {
            this.app.use("/", proxy("http://localhost:8090", {
                filter: (req) => {
                    return !req.path.startsWith("/api");
                }
            }));
            RouterService.loadPaths(this.app);
        } else {
            this.app.use("/", express.static(path.join(__dirname, "..", "frontend", "dist")));
            RouterService.loadPaths(this.app);
            this.app.get("/*", (req, res) => {
                res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
            });
        }
    }

    private async setupViews(views: Dictionary<View<any>>): Promise<void> {
        await ViewService.init(views);
    }

    public start(): void {
        this.app.listen(this.config.port, () => {
            LogService.log.info("Server listening on port: " + this.config.port);
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

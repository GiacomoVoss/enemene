"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemene = void 0;
const core_1 = require("@overnightjs/core");
const allow_headers_middleware_1 = require("../middleware/allow-headers.middleware");
const auth_1 = require("../auth");
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
const router_service_1 = require("../router/service/router.service");
const express = __importStar(require("express"));
const path_1 = __importDefault(require("path"));
const view_1 = require("../view");
const sequelize_typescript_1 = require("sequelize-typescript");
const log_1 = require("../log");
const db_import_1 = require("./bin/db-import");
const view_get_router_1 = __importDefault(require("../view/view-get.router"));
const view_post_router_1 = __importDefault(require("../view/view-post.router"));
const view_delete_router_1 = __importDefault(require("../view/view-delete.router"));
const auth_router_1 = __importDefault(require("../auth/auth.router"));
const model_router_1 = require("../model/model.router");
const bodyParser = require("body-parser");
require("express-async-errors");
class Enemene extends core_1.Server {
    constructor(config) {
        super(process.env.NODE_ENV === "development"); // setting showLogs to true
        this.config = config;
        this.devMode = process.env.NODE_ENV === "development";
        log_1.LogService.createLogger(config.logLevel, config.logPath);
        this.app.use(allow_headers_middleware_1.allowHeaders);
        this.app.use(bodyParser.json());
        log_1.LogService.log[config.logLevel.toLowerCase()]("Log level: " + config.logLevel.toUpperCase());
        this.config.port = `${this.normalizePort(config.port)}`;
        this.importDb = process.argv[2] === "import";
        this.db = new sequelize_typescript_1.Sequelize({
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
                const kebab = filename.substring(0, filename.indexOf(".model")).split("-");
                const camel = kebab.map((chunk) => chunk.substr(0, 1).toUpperCase() + chunk.substr(1).toLowerCase()).join("");
                return camel === member;
            },
            logging: sql => log_1.LogService.log.debug(sql),
        });
    }
    static create(config) {
        return __awaiter(this, void 0, void 0, function* () {
            Enemene.app = new Enemene(config);
            yield Enemene.app.db.authenticate();
            if (Enemene.app.importDb) {
                // Just import DB and teminate.
                yield new db_import_1.DbImport(Enemene.app.db).resetAndImportDb();
                process.exit(0);
            }
            return Enemene.app;
        });
    }
    setup(routers, views) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setupRouters(Object.assign(Object.assign({}, routers), { AuthRouter: auth_router_1.default,
                ViewGetRouter: view_get_router_1.default,
                ViewPostRouter: view_post_router_1.default,
                ViewDeleteRouter: view_delete_router_1.default,
                ModelRouter: model_router_1.ModelRouter }));
            yield this.setupViews(views);
            yield auth_1.PermissionService.buildCache();
        });
    }
    setupRouters(routers) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.values(routers)
                .filter((router) => !!router.prototype.$modulePath)
                .forEach((router) => {
                (router.prototype.$paths || []).forEach((pathDefinition) => {
                    router_service_1.RouterService.register(router.prototype.$modulePath, pathDefinition);
                });
            });
            if (this.showLogs) {
                this.app.use("/", express_http_proxy_1.default("http://localhost:8090", {
                    filter: (req) => {
                        return !req.path.startsWith("/api");
                    }
                }));
                router_service_1.RouterService.loadPaths(this.app);
            }
            else {
                this.app.use("/", express.static(path_1.default.join(__dirname, "..", "frontend", "dist")));
                router_service_1.RouterService.loadPaths(this.app);
                this.app.get("/*", (req, res) => {
                    res.sendFile(path_1.default.join(__dirname, "..", "frontend", "dist", "index.html"));
                });
            }
        });
    }
    setupViews(views) {
        return __awaiter(this, void 0, void 0, function* () {
            yield view_1.ViewService.init(views);
        });
    }
    start() {
        this.app.listen(this.config.port, () => {
            log_1.LogService.log.info("Server listening on port: " + this.config.port);
        });
    }
    normalizePort(val) {
        const port = (typeof val === "string") ? parseInt(val, 10) : val;
        if (isNaN(port)) {
            return null;
        }
        else if (port >= 0) {
            return port;
        }
        else {
            return null;
        }
    }
}
exports.Enemene = Enemene;
//# sourceMappingURL=enemene.js.map
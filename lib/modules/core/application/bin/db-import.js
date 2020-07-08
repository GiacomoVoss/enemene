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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbImport = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const log_level_enum_1 = require("../../log/enum/log-level.enum");
const log_service_1 = require("../../log/service/log.service");
const YAML = require("yaml");
class DbImport {
    constructor(db) {
        this.db = db;
    }
    resetAndImportDb() {
        return __awaiter(this, void 0, void 0, function* () {
            log_service_1.LogService.log.level = log_level_enum_1.LogLevel.INFO;
            const database = this.db.config.database;
            return this.db.transaction((t) => __awaiter(this, void 0, void 0, function* () {
                log_service_1.LogService.log.info("Deleting database");
                log_service_1.LogService.log.info("Creating new database");
                yield this.db.dropSchema(database, {
                    logging: sql => log_service_1.LogService.log.info(`[DbImport] ${sql}`),
                });
                yield this.db.query(`CREATE DATABASE ${database} CHARACTER SET = utf8 COLLATE = utf8_general_ci`);
                yield this.db.query(`USE ${database}`);
                yield this.db.sync({
                    logging: (sql) => log_service_1.LogService.log.info(`[DbImport] ${sql}`),
                    force: true,
                });
                yield this.importData(t);
                log_service_1.LogService.log.info("[DbImport] Import completed.");
            }));
        });
    }
    importData(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = fs.readdirSync("./fixtures");
                for (const i in files) {
                    yield this.importFile(path.join("./fixtures", files[i]), transaction);
                }
            }
            catch (err) {
                log_service_1.LogService.log.error(err);
            }
        });
    }
    importFile(file, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = fs.readFileSync(file, "utf8");
            const objects = YAML.parse(content);
            const creates = {};
            objects.forEach(object => {
                const model = Object.keys(object)[0];
                if (!creates[model]) {
                    creates[model] = [];
                }
                creates[model].push(Object.values(object)[0]);
            });
            const promises = [];
            Object.keys(creates).forEach(model => {
                promises.push(this.db.model(model).bulkCreate(creates[model], { transaction: transaction }));
                log_service_1.LogService.log.info(`[DbImport] Creating ${creates[model].length} objects for ${model}`);
            });
            yield Promise.all(promises);
        });
    }
}
exports.DbImport = DbImport;
//# sourceMappingURL=db-import.js.map
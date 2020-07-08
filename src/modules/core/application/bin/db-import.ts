import * as fs from "fs";
import * as path from "path";
import {Sequelize} from "sequelize-typescript";
import {LogLevel} from "../../log/enum/log-level.enum";
import {LogService} from "../../log/service/log.service";

const YAML = require("yaml");

export class DbImport {

    constructor(private db: Sequelize) {
    }

    public async resetAndImportDb() {
        LogService.log.level = LogLevel.INFO;
        const database: string = this.db.config.database;
        return this.db.transaction(async t => {
            LogService.log.info("Deleting database");
            LogService.log.info("Creating new database");
            await this.db.dropSchema(database, {
                logging: sql => LogService.log.info(`[DbImport] ${sql}`),
            });
            await this.db.query(`CREATE DATABASE ${database} CHARACTER SET = utf8 COLLATE = utf8_general_ci`);
            await this.db.query(`USE ${database}`);
            await this.db.sync({
                logging: (sql: string) => LogService.log.info(`[DbImport] ${sql}`),
                force: true,
            });
            await this.importData(t);
            LogService.log.info("[DbImport] Import completed.");
        });
    }

    private async importData(transaction) {
        try {
            const files: string[] = fs.readdirSync("./fixtures");
            for (const i in files) {
                await this.importFile(path.join("./fixtures", files[i]), transaction);
            }
        } catch (err) {
            LogService.log.error(err);
        }
    }

    private async importFile(file, transaction) {
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
            promises.push(this.db.model(model).bulkCreate(creates[model], {transaction: transaction}));
            LogService.log.info(`[DbImport] Creating ${creates[model].length} objects for ${model}`);
        });

        await Promise.all(promises);
    }
}

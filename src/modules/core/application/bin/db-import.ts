import * as fs from "fs";
import * as path from "path";
import {Sequelize} from "sequelize-typescript";
import {Enemene} from "../enemene";
import {Dictionary} from "../../../../base/type/dictionary.type";

const YAML = require("yaml");

export class DbImport {

    constructor(private db: Sequelize,
                private fixturesPath: string) {
    }

    public async resetAndImportDb() {
        const database: string = this.db.config.database;
        return this.db.transaction(async t => {
            Enemene.log.info(this.constructor.name, "Clearing database");
            await this.db.query(`DROP DATABASE IF EXISTS \`${database}\``);
            await this.db.query(`CREATE DATABASE \`${database}\` CHARACTER SET = utf8 COLLATE = utf8_general_ci`);
            await this.db.query(`USE \`${database}\``);
            await this.db.sync({
                logging: (sql: string) => Enemene.log.debug(this.constructor.name, sql),
            });
            await this.db.dropSchema("_ignore", {
                logging: (sql: string) => Enemene.log.debug(this.constructor.name, sql),
            });
            await this.importData(t);
            Enemene.log.info(this.constructor.name, "Import completed.");
        });
    }

    private async importData(transaction) {
        try {
            const files: string[] = fs.readdirSync(this.fixturesPath);
            for (const i in files) {
                await this.importFile(path.join(this.fixturesPath, files[i]), transaction);
            }
        } catch (err) {
            Enemene.log.error(this.constructor.name, err);
        }
    }

    private async importFile(file, transaction) {
        const content = fs.readFileSync(file, "utf8");

        const objects = YAML.parse(content);
        const creates: Dictionary<object[]> = {};
        objects.forEach(object => {
            const model = Object.keys(object)[0];
            if (!creates[model]) {
                creates[model] = [];
            }
            creates[model].push(Object.values(object)[0] as object);
        });

        const promises = [];
        Object.keys(creates).forEach(model => {
            promises.push(this.db.model(model).bulkCreate(creates[model], {transaction: transaction}));
            Enemene.log.info(this.constructor.name, `Creating ${creates[model].length} objects for ${model}`);
        });

        await Promise.all(promises);
    }
}

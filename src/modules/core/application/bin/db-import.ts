import * as fs from "fs";
import * as path from "path";
import {Sequelize} from "sequelize-typescript";
import {Enemene} from "../enemene";
import {UuidService} from "../../../..";
import {omit} from "lodash";

const YAML = require("yaml");

export class DbImport {

    constructor(private db: Sequelize,
                private fixturesPaths: string[]) {
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
            for (const fixturesPath of this.fixturesPaths) {
                const files: string[] = fs.readdirSync(fixturesPath);
                for (const i in files) {
                    await this.importFile(path.join(fixturesPath, files[i]), transaction);
                }
            }
        } catch (err) {
            Enemene.log.error(this.constructor.name, err);
        }
    }

    private async importFile(file, transaction) {
        const content = fs.readFileSync(file, "utf8");

        const objects = YAML.parse(content);
        const creates: any[] = [];
        if (objects) {
            objects.forEach(object => {
                const model = Object.keys(object)[0];
                const data: any = Object.values(object)[0] as object;
                if (!data.id) {
                    data.id = UuidService.getUuid();
                }
                data.$model = model;
                creates.push(data);
            });
        }

        for (const object of creates) {
            Enemene.log.info(this.constructor.name, `Creating ${object.$model} with ID "${object.id}".`);
            await this.db.model(object.$model).create(omit(object, "$model"), {transaction: transaction});
        }
    }
}

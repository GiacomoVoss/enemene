import {Migration} from "../model/migration.model";
import {DataService} from "../../data";
import {FileService} from "../../file/service/file.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {keyBy} from "lodash";
import * as fs from "fs";
import {Sequelize} from "sequelize";
import {LogService} from "../../log/service/log.service";
import path from "path";

export class MigrationService {

    constructor(private fileService: FileService,
                private log: LogService,
                private db: Sequelize) {
    }

    async execute(): Promise<boolean> {
        let success: boolean = true;
        const migrations: Migration[] = await DataService.findAllRaw(Migration, {
            order: [["executedAt", "ASC"]],
        });

        const failedMigration: Migration | undefined = migrations.find(m => !m.success);
        if (failedMigration) {
            this.log.error(this.constructor.name, `Database contains a failed migration for version ${failedMigration.version}`);
            return false;
        }

        const migrationsByVersion: Dictionary<Migration> = keyBy(migrations, "version");

        const migrationFiles: string[] = this.fileService.scanForFilePattern(process.cwd(), /migration-.*\.sql/);
        migrationFiles.sort();

        for (const migrationFile of migrationFiles) {
            let version: string = migrationFile.split(path.sep).pop();
            version = version.replace(/[^0-9]*([0-9.]+)\.sql/, "$1");

            if (migrationsByVersion[version]) {
                continue;
            }

            this.log.info(this.constructor.name, `Executing migration for version ${version}`);
            const sql: string = fs.readFileSync(migrationFile, {encoding: "utf8"});
            try {
                await this.db.transaction(async transaction => {
                    await this.db.query(sql, {
                        transaction,
                    });

                    await Migration.create({
                        executedAt: new Date(),
                        fileName: migrationFile,
                        version,
                        success: true,
                    });

                });
            } catch (e) {
                this.log.error(this.constructor.name, `Migration for version ${version} failed: ${e.message}`);
                await Migration.create({
                    executedAt: new Date(),
                    fileName: migrationFile,
                    version,
                    success: false,
                });
                success = false;
                break;
            }
        }

        return success;
    }
}
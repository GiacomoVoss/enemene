import { Sequelize } from "sequelize-typescript";
export declare class DbImport {
    private db;
    constructor(db: Sequelize);
    resetAndImportDb(): Promise<void>;
    private importData;
    private importFile;
}

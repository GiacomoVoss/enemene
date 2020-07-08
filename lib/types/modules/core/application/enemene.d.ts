import { Server } from "@overnightjs/core";
import { View } from "../view";
import { EnemeneConfig } from "./interface/enemene-config.interface";
import { Sequelize } from "sequelize-typescript";
import { Dictionary } from "../../../base/type/dictionary.type";
export { EnemeneConfig } from "./interface/enemene-config.interface";
export declare class Enemene extends Server {
    config: EnemeneConfig;
    static app: Enemene;
    db: Sequelize;
    devMode: boolean;
    private importDb;
    constructor(config: EnemeneConfig);
    static create(config: EnemeneConfig): Promise<Enemene>;
    setup(routers: Dictionary<Function>, views: Dictionary<View<any>>): Promise<void>;
    private setupRouters;
    private setupViews;
    start(): void;
    private normalizePort;
}

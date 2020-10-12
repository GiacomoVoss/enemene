import {Table} from "sequelize-typescript";
import {snakeCase} from "lodash";
import {DataObject} from "../data-object.model";

export function Entity(target: new () => DataObject<any>): void {
    Table({
        tableName: snakeCase(target.name),
    })(target);
}

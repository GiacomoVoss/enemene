import {Table} from "sequelize-typescript";
import {snakeCase} from "lodash";

export function Entity(target: Function): void {
    Table({
        tableName: snakeCase(target.name),
    })(target);
}

export function EntityNamed(tableName: string): Function {
    return Table({
        tableName: tableName,
    });
}

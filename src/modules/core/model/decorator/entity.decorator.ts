import {DataObject} from "../data-object.model";

export function Entity(target: new () => DataObject<any>): void {
    // Table({
    //     tableName: snakeCase(target.name),
    //     getterMethods: {
    //         $entity: () => target.name,
    //     }
    // })(target);
}

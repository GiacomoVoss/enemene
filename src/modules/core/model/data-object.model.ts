import {Column, Model, Table} from "sequelize-typescript";
import {BuildOptions} from "sequelize";
import {Dictionary} from "../../../base/type/dictionary.type";

/**
 * Basic abstract entity model.
 */
@Table({
    tableName: "_ignore",
})
export class DataObject<E> extends Model<DataObject<E>> {

    $entity = this.constructor.name;
    $displayPattern = "{id}";
    $allowedValues?: Dictionary<Function, keyof this>;

    @Column({
        primaryKey: true,
    })
    id: string;

    constructor(values?: Dictionary<any, keyof E>, options?: BuildOptions) {
        super(values, options);
    }

    toJSON(): any {
        return super.toJSON();
        // function unfold(value) {
        //     if (value == null) {
        //         return null;
        //     }
        //     if (value.toJSON) {
        //         return value.toJSON();
        //     } else if (Array.isArray(value)) {
        //         return value.map(v => unfold(v));
        //     } else {
        //         return value;
        //     }
        // }
        //
        // const fields: string[] = Object.keys(super.toJSON());
        //
        // const obj = {};
        // fields.forEach(field => {
        //     let value: any = this[field];
        //     if (value === null || value === undefined) {
        //         value = this[field];
        //     }
        //
        //     if (value !== null && value !== undefined) {
        //         obj[field] = unfold(value);
        //     }
        // });
        //
        // return obj;
    }
}

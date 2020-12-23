import {BuildOptions, Model} from "sequelize";
import {Dictionary} from "../../../base/type/dictionary.type";

/**
 * Basic abstract entity model.
 */
export class DataObject<E> extends Model<DataObject<E>> {

    $entity: string;
    $displayPattern: string = "{id}";
    $allowedValues?: Dictionary<Function, keyof this>;

    id: string;

    constructor(values?: Dictionary<any, keyof E>, options?: BuildOptions) {
        super(values, options);
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            $displayPattern: this.$displayPattern,
            $entity: this.$entity,
        };
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

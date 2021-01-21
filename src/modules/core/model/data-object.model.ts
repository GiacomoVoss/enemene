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
    }
}

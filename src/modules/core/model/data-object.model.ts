import {BuildOptions, Model} from "sequelize";
import {Dictionary} from "../../../base/type/dictionary.type";

/**
 * Basic abstract entity model.
 */
export class DataObject<E> extends Model {

    $entity: string;
    $displayPattern: string = "{id}";
    $allowedValues?: Dictionary<Function, keyof this>;

    id: string;

    constructor(values?: Dictionary<any>, options?: BuildOptions) {
        super(values, options);
    }

    public toJSON(): any {
        return {
            ...super.toJSON(),
            $displayPattern: this.$displayPattern,
            $entity: this.$entity,
        };
    }
}

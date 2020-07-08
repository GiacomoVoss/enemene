import {Column, Model, Table} from "sequelize-typescript";
import {JsonDefinition} from "./type/json-definition.type";
import {JsonRule} from "./interface/json-rule.interface";
import {BuildOptions} from "sequelize";
import {Dictionary} from "../../../base/type/dictionary.type";

/**
 * Basic abstract entity model.
 */
@Table
export class DataObject<E> extends Model<DataObject<E>> {

    $entity = this.constructor.name;
    $displayPattern = "{id}";

    @Column({
        primaryKey: true,
    })
    id: string;

    /**
     * Contains the definition for turning this object into JSON.
     */
    jsonDefinition?: JsonDefinition;

    constructor(values?: Dictionary<any, keyof E>, options?: BuildOptions) {
        super(values, options);
    }

    /**
     * Turns the object into JSON based on the {@link jsonDefinition}.
     */
    toJSON(): any {

        function unfold(value) {
            if (value == null) {
                return null;
            }
            if (value.toJSON) {
                return value.toJSON();
            } else if (Array.isArray(value)) {
                return value.map(v => unfold(v));
            } else {
                return value;
            }
        }

        const jsonDefinition: JsonDefinition = this.jsonDefinition || [];
        const fields: string[] = Object.keys(super.toJSON());

        const obj = {};
        fields.forEach(field => {
            let value: any;
            let key: string;
            const jsonRule: JsonRule = jsonDefinition[field];
            if (jsonRule) {
                if (jsonRule.key || jsonRule.fn) {
                    key = jsonRule.jsonKey || jsonRule.key;
                    value = this.getDataValue<any>(jsonRule.key);
                    if (value === null || value === undefined) {
                        value = this[jsonRule.key];
                    }
                    if (jsonRule.fn) {
                        value = jsonRule.fn(value);
                    }
                }
            } else {
                key = field;
                value = this.getDataValue<any>(key) || this[key];
                if (value === null || value === undefined) {
                    value = this[key];
                }
            }

            if (value !== null && value !== undefined) {
                obj[key] = unfold(value);
            }
        });

        return obj;
    }
}

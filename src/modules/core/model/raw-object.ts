import {Dictionary} from "../../../base/type/dictionary.type";
import {DataObject} from "./data-object.model";
import {ModelService} from "./service/model.service";
import {EntityField} from "./interface/entity-field.class";
import {Transaction} from "sequelize/types/lib/transaction";

export class RawObject<T> extends Object {

    $entity: string;

    id: string;

    constructor(entity: string, values?: Dictionary<any>) {
        super(values);
        this.$entity = entity;
    }

    public async save(transaction?: Transaction): Promise<DataObject<T>> {
        const model: Dictionary<EntityField> = ModelService.MODEL[this.$entity];
        const object: DataObject<T> = new DataObject<T>();

        return object;
    }

    toJSON(): any {
        const data: any = {};
        Object.entries(this).forEach(([key, value]) => {
            if (value instanceof RawObject) {
                data[key] = value.toJSON();
            } else if (Array.isArray(value)) {
                data[key] = value.map((v: any) => {
                    if (v instanceof RawObject) {
                        data[key] = v.toJSON();
                    } else {
                        data[key] = v;
                    }
                });
            } else {
                data[key] = value;
            }
        });
        return {
            $entity: this.$entity,
            ...data,
        };
    }
}

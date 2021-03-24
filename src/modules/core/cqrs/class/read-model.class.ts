import {uuid} from "../../../../base/type/uuid.type";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export abstract class ReadModel {
    $endpoint: string;
    $eventHandlers: EventHandlerDefinition[];

    constructor(public id: uuid,
                public deleted: boolean = false) {
    }


    toJSON(): Dictionary<serializable> {
        return Object.getOwnPropertyNames(this).reduce((result: Dictionary<serializable>, key: string) => {
            const value: any = this[key];
            if (Array.isArray(value)) {
                result[key] = (value as any[]).map(v => this.toJSONInternal(v));
            } else {
                result[key] = this.toJSONInternal(value);
            }

            return result;
        }, {});
    }

    private toJSONInternal(value: any): Dictionary<serializable> {
        if (value instanceof ReadModel) {
            return value.toJSON();
        } else {
            return value;
        }
    }
}
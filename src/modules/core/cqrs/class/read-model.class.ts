import {uuid} from "../../../../base/type/uuid.type";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {EnemeneCqrs} from "../../application";
import {ObjectRepositoryService} from "../service/object-repository.service";
import {UnsupportedOperationError} from "../../error";

export class ReadModel {
    $endpoint: string;
    $eventHandlers: Dictionary<EventHandlerDefinition>;
    $eventPosition: number = 0;

    constructor(public id: uuid,
                public version: number = 0,
                public deleted: boolean = false) {
    }


    toJSON<T extends ReadModel>(recursionIds: uuid[] = []): Dictionary<serializable, keyof T> {
        return Object.getOwnPropertyNames(this)
            .filter(key => !key.startsWith("$"))
            .reduce((result: Dictionary<serializable>, key: string) => {
                const value: any = this[key];
                if (Array.isArray(value)) {
                    result[key] = (value as any[]).map(v => this.toJSONInternal(v, [...recursionIds, this.id]));
                } else {
                    result[key] = this.toJSONInternal(value, [...recursionIds, this.id]);
                }

                return result;
            }, {}) as Dictionary<serializable, keyof T>;
    }

    private toJSONInternal(value: any, recursionIds: uuid[]): Dictionary<serializable> {
        if (value instanceof ReadModel) {
            if (recursionIds.includes(value.id)) {
                return {
                    id: value.id,
                };
            } else {
                return value.toJSON(recursionIds);
            }
        } else {
            return value;
        }
    }

    protected resolveObjectReference<READMODEL extends ReadModel>(clazz: ConstructorOf<READMODEL>, id: uuid): READMODEL {
        return EnemeneCqrs.app.inject(ObjectRepositoryService).getOrCreateObject(clazz, id);
    }


    public snapshotSerialize(): Dictionary<serializable> {
        return Object.getOwnPropertyNames(this).reduce((result: Dictionary<serializable>, key: string) => {
            const value: any = this[key];
            if (Array.isArray(value)) {
                result[key] = (value as any[]).map(v => this.serializeInternal(v));
            } else {
                result[key] = this.serializeInternal(value);
            }

            return result;
        }, {});
    }

    private serializeInternal(value: any): any {
        if (value instanceof ReadModel) {
            return `#Ref#${value.constructor.name}#${value.id}`;
        } else if (typeof value === "function") {
            throw new UnsupportedOperationError("Read models should only contain serializable data, no functions.");
        } else {
            return value;
        }
    }

    public snapshotDeserialize(data: any, readModelClasses: Dictionary<ConstructorOf<ReadModel>>): void {
        Object.entries(data).forEach(([key, value]) => {
            this[key] = this.deserializeInternal(value, readModelClasses);
        });
    }

    private deserializeInternal(value: any, readModelClasses: Dictionary<ConstructorOf<ReadModel>>): any {
        if (value === null || value === undefined) {
            return value;
        } else if (Array.isArray(value)) {
            return value.map(v => this.deserializeInternal(v, readModelClasses));
        } else if (typeof value === "object") {
            return Object.entries(value).reduce((result: any, [key, value]) => {
                result[key] = this.deserializeInternal(value, readModelClasses);
                return result;
            }, {});
        } else if (typeof value === "string") {
            const matches: RegExpMatchArray | null = (value as string).match(/#Ref#(\w+)#([-\w]+)/);
            if (matches) {
                return this.resolveObjectReference(readModelClasses[matches[1]], matches[2]);
            }
            return value;
        } else {
            return value;
        }
    }
}
import {uuid} from "../../../../base/type/uuid.type";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {EnemeneCqrs} from "../../application";
import {ObjectRepositoryService} from "../service/object-repository.service";
import {UnsupportedOperationError} from "../../error";
import {AbstractFilter} from "../../filter";

export class ReadModel {
    $endpoint: string;
    $isPublic: boolean;
    $filter?: AbstractFilter;
    $eventHandlers: Dictionary<EventHandlerDefinition>;
    $eventPosition: number = 0;

    constructor(public id: uuid,
                public version: number = 0,
                public deleted: boolean = false) {
    }

    toJSON() {
        return this.serialize();
    }

    serialize<T extends ReadModel>(recursionIds: uuid[] = []): Dictionary<serializable, keyof T> {
        return Object.getOwnPropertyNames(this)
            .filter(key => !key.startsWith("$"))
            .reduce((result: Dictionary<serializable>, key: string) => {
                const value: any = this[key];
                result[key] = this.serializeInternal(value, [...recursionIds, this.id]);
                return result;
            }, {}) as Dictionary<serializable, keyof T>;
    }

    private serializeInternal(value: any, recursionIds: uuid[]): any {
        if (value === null || value === undefined) {
            return value;
        } else if (value instanceof ReadModel) {
            if (recursionIds.includes(value.id)) {
                return {
                    id: value.id,
                };
            } else {
                return value.serialize(recursionIds);
            }
        } else if (Array.isArray(value)) {
            return value.map(v => this.serializeInternal(v, recursionIds));
        } else if (typeof value === "object" && !value.toJSON) {
            return Object.getOwnPropertyNames(value)
                .reduce((result: Dictionary<serializable>, key: string) => {
                    result[key] = this.serializeInternal(value[key], [...recursionIds, this.id]);
                    return result;
                }, {}) as Dictionary<serializable>;
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
            result[key] = this.snapshotSerializeInternal(value);
            return result;
        }, {});
    }

    private snapshotSerializeInternal(value: any): any {
        if (value === null || value === undefined) {
            return value;
        }
        if (value instanceof ReadModel) {
            return `#Ref#${value.constructor.name}#${value.id}`;
        } else if (Array.isArray(value)) {
            return (value as any[]).map(v => this.snapshotSerializeInternal(v));
        } else if (value instanceof Date) {
            return value;
        } else if (typeof value === "object") {
            if (value.toJSON) {
                return value.toJSON();
            } else {
                return Object.getOwnPropertyNames(value).reduce((result: Dictionary<serializable>, key: string) => {
                    result[key] = this.snapshotSerializeInternal(value[key]);
                    return result;
                }, {});
            }
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
        } else if (value instanceof Date) {
            return value;
        } else if (typeof value === "object") {
            return Object.entries(value).reduce((result: any, [key, v]) => {
                result[key] = this.deserializeInternal(v, readModelClasses);
                return result;
            }, {});
        } else if (typeof value === "string") {
            const matches: RegExpMatchArray | null = (value as string).match(/#Ref#(\w+)#([-\w]+)/);
            if (matches) {
                return this.resolveObjectReference(readModelClasses[matches[1]], matches[2]);
            }
            if (value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/)) {
                return new Date(Date.parse(value));
            }
            return value;
        } else {
            return value;
        }
    }
}
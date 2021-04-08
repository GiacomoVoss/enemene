import {ReadModel} from "../class/read-model.class";
import {ConstructorOf} from "../../../../base/constructor-of";
import {uuid} from "../../../../base/type/uuid.type";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ReadModelRegistryService} from "./read-model-registry.service";
import {EnemeneCqrs} from "../../application";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";
import {UnrestrictedRequestContext} from "../../router";
import {ObjectNotFoundError} from "../../error";
import {get, orderBy, set} from "lodash";
import {PermissionCqrsService} from "../../auth/service/permission-cqrs.service";
import {serializable} from "../../../../base/type/serializable.type";
import {InvalidAttributePathError} from "../../view/error/invalid-attribute-path.error";
import {ObjectsQueryInput} from "../interface/objects-query-input.interface";
import {AbstractFilter, FilterService} from "../../filter";

export class ObjectRepositoryService {

    private permissionCqrsService: PermissionCqrsService = EnemeneCqrs.app.inject(PermissionCqrsService);
    private readModelRegistry: ReadModelRegistryService = EnemeneCqrs.app.inject(ReadModelRegistryService);

    public objects: Dictionary<Dictionary<ReadModel>> = {};

    public static getObjectsQueryInput(fields?: string, orderString?: string, limitString?: string, offsetString?: string, filterString?: string): ObjectsQueryInput {
        const input: ObjectsQueryInput = {
            fields,
        };

        if (orderString) {
            const orderTokens: string[] = orderString.toLowerCase().split(",");
            input.order = orderTokens.map(token => {
                const tokenTokens: string[] = token.split(":");
                let direction: "asc" | "desc" = "asc";
                if (tokenTokens[1] && tokenTokens[1] === "desc") {
                    direction = "desc";
                }

                return [tokenTokens[0], direction];
            });
        }

        if (limitString) {
            const limit: number = parseInt(limitString);
            if (!isNaN(limit)) {
                input.limit = limit;
            }
        }

        if (offsetString) {
            const offset: number = parseInt(offsetString);
            if (!isNaN(offset)) {
                input.offset = offset;
            }
        }

        if (filterString) {
            input.filter = FilterService.stringToFilter(filterString);
        }

        return input;
    }

    public getObjectWithPermissions<T extends ReadModel>(readModel: ConstructorOf<T>, id: uuid, context: RequestContext<AbstractUserReadModel>, fields?: string, includeDeleted: boolean = false): T {
        const object: ReadModel | undefined = this.objects[readModel.name]?.[id];
        const shouldIncludeDeleted = context instanceof UnrestrictedRequestContext && includeDeleted;

        if (!object) {
            throw new ObjectNotFoundError(readModel.name);
        }

        if (object.deleted && !shouldIncludeDeleted) {
            throw new ObjectNotFoundError(readModel.name);
        }

        return this.getByFields(this.permissionCqrsService.getFilteredObject(object, context, this), fields);
    }

    public getObject<T extends ReadModel>(readModel: ConstructorOf<T>, id: uuid, includeDeleted: boolean = false): T | null {
        const object: T | undefined = this.objects[readModel.name]?.[id] as T | undefined;

        if (!object) {
            return null;
        }

        if (object.deleted && !includeDeleted) {
            return null;
        }

        return object;
    }

    public getObjectsWithPermissions<T extends ReadModel>(readModel: ConstructorOf<T>, context: RequestContext<AbstractUserReadModel>, query?: ObjectsQueryInput, includeDeleted: boolean = false): Dictionary<serializable, keyof T>[] {
        const objects: Dictionary<T> | undefined = this.objects[readModel.name] as Dictionary<T> | undefined;
        const shouldIncludeDeleted = context instanceof UnrestrictedRequestContext && includeDeleted;

        if (!objects) {
            throw new ObjectNotFoundError(readModel.name);
        }

        let result: Dictionary<serializable, keyof T>[] = this.permissionCqrsService.getFilteredObjects(Object.values(objects), context, this);

        if (query.filter) {
            result = result.filter(object => query.filter.evaluate(object, context));
        }

        if (!shouldIncludeDeleted) {
            result = result.filter(object => !object.deleted);
        }

        if (query.order) {
            const iteratees: string[][] = query.order.reduce((result: string[][], [field, direction]) => {
                result[0].push(field);
                result[1].push(direction);
                return result;
            }, [[], []]);
            result = orderBy(result, ...iteratees);
        }

        if (query.limit) {
            const offset: number = query.offset ?? 0;
            result = result.slice(offset, offset + query.limit);
        }

        return result.map(object => this.getByFields(object, query?.fields));
    }

    public countObjectsWithPermission<T extends ReadModel>(readModel: ConstructorOf<T>, context: RequestContext<AbstractUserReadModel>, query?: ObjectsQueryInput, includeDeleted: boolean = false): number {
        const objects: Dictionary<T> | undefined = this.objects[readModel.name] as Dictionary<T> | undefined;
        const shouldIncludeDeleted = context instanceof UnrestrictedRequestContext && includeDeleted;

        if (!objects) {
            throw new ObjectNotFoundError(readModel.name);
        }

        let result: Dictionary<serializable, keyof T>[] = this.permissionCqrsService.getFilteredObjects(Object.values(objects), context, this);
        if (query.filter) {
            result = result.filter(object => query.filter.evaluate(object, context));
        }

        if (!shouldIncludeDeleted) {
            result = result.filter(object => !object.deleted);
        }

        return result.length;
    }

    public getObjects<T extends ReadModel>(readModel: ConstructorOf<T>, filter?: AbstractFilter, includeDeleted: boolean = false): T[] {
        const objects: Dictionary<T> | undefined = this.objects[readModel.name] as Dictionary<T> | undefined;

        if (!objects) {
            throw new ObjectNotFoundError(readModel.name);
        }

        const result: T[] = Object.values(objects)
            .filter(object => !object.deleted || includeDeleted);
        if (filter) {
            return filter.apply(result);
        } else {
            return result;
        }
    }

    private getByFields(data?: any, fieldsString?: string): any {
        if (!data) {
            return undefined;
        }
        if (!fieldsString) {
            return data;
        }

        const fields: string[] = fieldsString.split(",");
        const fieldsMap: any = fields.reduce((map: any, field: string) => {
            set(map, field.trim(), true);
            return map;
        }, {});

        const values: Dictionary<serializable> = {};

        for (let [field, subFields] of Object.entries(fieldsMap)) {
            let value: any = get(data, field);
            if (Object.keys(subFields).includes("$count")) {
                if (Array.isArray(value) || value === undefined) {
                    values[field + ".$count"] = (value ?? []).length;
                } else {
                    throw new InvalidAttributePathError(field);
                }
            } else if (typeof subFields === "boolean") {
                values[field] = value;
            } else if (Array.isArray(value)) {
                if (!value.length) {
                    values[field] = [];
                } else if (typeof value[0] === "object") {
                    const subFieldsString: string = Object.keys(this.dotize(subFields)).join(",");
                    values[field] = value.map(v => this.getByFields(v, subFieldsString));
                }
            } else if (typeof value === "object") {
                const subFieldsString: string = Object.keys(this.dotize(subFields)).join(",");
                values[field] = this.getByFields(value, subFieldsString);
            }
        }
        values.id = data.id;
        values.version = data.version;

        return values;
    }

    public deserializeSnapshot(data: any): void {
        for (const readModelName in data) {
            if (data.hasOwnProperty(readModelName)) {
                for (const id in data[readModelName]) {
                    if (data[readModelName].hasOwnProperty(id)) {
                        const object: ReadModel = this.getOrCreateObject(readModelName, id);
                        object.snapshotDeserialize(data[readModelName][id], this.readModelRegistry.readModelClasses);
                        object.snapshotDeserialize(data[readModelName][id], this.readModelRegistry.readModelClasses);
                    }
                }
            }
        }
    }

    public serializeSnapshot(): Dictionary<serializable> {
        return Object.entries(this.objects).reduce((completeResult: Dictionary<serializable>, [readModelName, entries]) => {
            completeResult[readModelName] = Object.entries(entries).reduce((subResult: Dictionary<serializable>, [id, object]) => {
                subResult[id] = object.snapshotSerialize();
                return subResult;
            }, {});
            return completeResult;
        }, {});
    }

    public getOrCreateObject<T extends ReadModel>(name: string | ConstructorOf<T>, id: uuid): T {
        const readModelName: string = typeof name === "string" ? name : name.name;
        if (!this.objects[readModelName]) {
            this.objects[readModelName] = {};
        }
        if (!this.objects[readModelName][id]) {
            this.objects[readModelName][id] = new (this.readModelRegistry.getReadModelConstructor(readModelName))(id);
        }
        return this.objects[readModelName][id] as T;
    }

    private dotize(jsonobj: any, prefix?: string) {
        var newobj = {};

        function recurse(o, p) {
            for (const f in o) {
                const pre = (p === undefined ? "" : p + ".");
                if (o[f] && typeof o[f] === "object") {
                    newobj = recurse(o[f], pre + f);
                } else {
                    newobj[pre + f] = o[f];
                }
            }
            return newobj;
        }

        return recurse(jsonobj, prefix);
    }
}
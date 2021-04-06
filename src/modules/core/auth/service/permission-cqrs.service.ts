import {Aggregate, ReadModel, ReadModelFieldPermissions, RoleReadModel} from "../../cqrs";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../interface/abstract-user-read-model.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ObjectRepositoryService} from "../../cqrs/service/object-repository.service";
import {FilterService} from "../../filter";
import {ForbiddenError} from "../error/forbidden.error";
import {defaults} from "lodash";

export class PermissionCqrsService {

    public checkCommandPermission(endpoint: string, aggregate: Aggregate, context: RequestContext<AbstractUserReadModel>, repository: ObjectRepositoryService): void {
        const role: RoleReadModel = repository.getObject(RoleReadModel, context.currentUser.roleId);
        if (!role) {
            throw new ForbiddenError();
        }
        let permitted: boolean = false;
        role.commandPermissions
            .filter(permission => permission.endpoint === endpoint)
            .forEach(permission => {
                if (!permission.filter) {
                    permitted = true;
                } else if (FilterService.stringToFilter(permission.filter).evaluate(aggregate, context)) {
                    permitted = true;
                }
            });

        if (!permitted) {
            throw new ForbiddenError();
        }
    }

    public getFilteredObjects<T extends ReadModel>(objects: T[], context: RequestContext<AbstractUserReadModel>, repository: ObjectRepositoryService): Dictionary<serializable, keyof T>[] {
        const role: RoleReadModel = repository.getObject(RoleReadModel, context.currentUser.roleId);
        if (!role) {
            return [];
        }
        const result: Dictionary<Dictionary<serializable, keyof T>> = {};

        if (!objects.length) {
            return [];
        }

        const readModelName: string = objects[0].$endpoint;

        role.readModelPermissions
            .filter(permission => permission.readModel === readModelName)
            .forEach(permission => {
                const singleObjectsResult: ReadModel[] = permission.filter ? FilterService.stringToFilter(permission.filter).apply(objects, context) : objects;
                if (singleObjectsResult.length) {
                    singleObjectsResult.forEach(singleObject => {
                        const singleResult: Dictionary<serializable, keyof T> = this.filterFields(singleObject.toJSON(), permission.fields);
                        result[singleObject.id] = {
                            ...defaults(result[singleObject.id], singleResult),
                        };
                    }, result);
                }
            });

        return Object.values(result);
    }

    public getFilteredObject<T extends ReadModel>(object: T, context: RequestContext<AbstractUserReadModel>, repository: ObjectRepositoryService): Dictionary<serializable, keyof T> {
        const role: RoleReadModel = repository.getObject(RoleReadModel, context.currentUser.roleId);
        if (!role) {
            return undefined;
        }
        const result: Dictionary<serializable, keyof T> = {};

        role.readModelPermissions
            .filter(permission => permission.readModel === object.$endpoint)
            .forEach(permission => {
                if (!permission.filter || FilterService.stringToFilter(permission.filter).evaluate(object, context)) {
                    const singleResult: Dictionary<serializable> = this.filterFields(object.toJSON(), permission.fields);
                    defaults(result, singleResult);
                }
            });

        return result;
    }

    private filterFields<T extends ReadModel>(object: Dictionary<serializable, keyof T>, fields: ReadModelFieldPermissions | true): Dictionary<serializable, keyof T> {
        if (fields === true) {
            return object;
        }

        const result: Dictionary<serializable, keyof T> = {};
        result.id = object.id;
        Object.entries(fields).forEach(([key, value]) => {
            if (value === true) {
                result[key] = object[key];
            } else if (typeof value === "object") {
                result[key] = this.filterFields(object[key] as object, value);
            }
        });

        return result;
    }
}
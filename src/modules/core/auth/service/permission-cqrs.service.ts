import {ReadModel, ReadModelFieldPermissions, ReadModelRepositoryService, RoleReadModel} from "../../cqrs";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../interface/abstract-user-read-model.interface";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {merge} from "lodash";

export class PermissionCqrsService {

    public getFilteredObjects(objects: ReadModel[], context: RequestContext<AbstractUserReadModel>, repository: ReadModelRepositoryService): Dictionary<serializable>[] {
        const role: RoleReadModel = repository.getObject(RoleReadModel, context.currentUser.roleId);
        const result: Dictionary<Dictionary<serializable>> = {};

        role.readModelPermissions.forEach(permission => {
            const singleObjectsResult: ReadModel[] = permission.filter ? permission.filter.apply(objects) : objects;
            if (singleObjectsResult.length) {
                singleObjectsResult.forEach(singleObject => {
                    const singleResult: Dictionary<serializable> = this.filterFields(singleObject.toJSON(), permission.fields);
                    result[singleObject.id] = merge({}, result[singleObject.id], singleResult);
                }, result);
            }
        });

        return Object.values(result);
    }

    public getFilteredObject(object: ReadModel, context: RequestContext<AbstractUserReadModel>, repository: ReadModelRepositoryService): Dictionary<serializable> {
        const role: RoleReadModel = repository.getObject(RoleReadModel, context.currentUser.roleId);
        const result: Dictionary<serializable> = {};

        role.readModelPermissions.forEach(permission => {
            if (permission.filter.evaluate(object)) {
                const singleResult: Dictionary<serializable> = this.filterFields(object.toJSON(), permission.fields);
                merge({}, result, singleResult);
            }
        });

        return result;
    }

    private filterFields(object: Dictionary<serializable>, fields: ReadModelFieldPermissions | true): Dictionary<serializable> {
        if (fields === true) {
            return object;
        }

        const result: Dictionary<serializable> = {
            id: object.id,
        };
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
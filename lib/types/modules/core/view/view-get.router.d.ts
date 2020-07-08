import { AbstractUser } from "../auth";
import { DataResponse } from "../data";
import { DataObject } from "../model";
import { Dictionary } from "../../../base/type/dictionary.type";
import { EntityField } from "../model/interface/entity-field.class";
import { uuid } from "../../../base/type/uuid.type";
import { serializable } from "../../../base/type/serializable.type";
export default class ViewGetRouter {
    getObjects<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, orderString: string, context: Dictionary<serializable>): Promise<DataResponse<ENTITY>>;
    getObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: string, context: Dictionary<serializable>): Promise<DataResponse<ENTITY>>;
    getCollection<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: string, collectionField: keyof ENTITY, context: Dictionary<serializable>): Promise<DataResponse<any>>;
    getCollectionObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: uuid, collectionField: keyof ENTITY, subObjectId: uuid, context: Dictionary<serializable>): Promise<DataResponse<any>>;
    getViewModel(user: AbstractUser, viewName: string): Promise<Dictionary<Dictionary<EntityField> | string>>;
}

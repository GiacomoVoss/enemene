import { DataObject } from "../model";
import { AbstractUser } from "../auth";
import { uuid } from "../../../base/type/uuid.type";
import { Dictionary } from "../../../base/type/dictionary.type";
import { serializable } from "../../../base/type/serializable.type";
export default class ViewDeleteRouter {
    deleteObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: uuid, context: Dictionary<serializable>): Promise<void>;
    deleteCollectionObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: uuid, collectionField: keyof ENTITY, subObjectId: uuid, context: Dictionary<serializable>): Promise<void>;
}

import { DataResponse } from "../data";
import { DataObject } from "../model";
import { AbstractUser } from "../auth";
import { Dictionary } from "../../../base/type/dictionary.type";
import { uuid } from "../../../base/type/uuid.type";
import { serializable } from "../../../base/type/serializable.type";
export default class ViewPostRouter {
    createObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, data: Dictionary<serializable>, context: Dictionary<serializable>): Promise<DataResponse<ENTITY>>;
    createCollectionObject<ENTITY extends DataObject<ENTITY>>(user: AbstractUser, viewName: string, objectId: uuid, collectionField: keyof ENTITY, data: Dictionary<serializable>, context: Dictionary<serializable>): Promise<DataResponse<ENTITY>>;
}

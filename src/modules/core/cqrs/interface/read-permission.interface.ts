import {uuid} from "../../../../base/type/uuid.type";
import {ReadModelFieldPermissions} from "../type/read-model-permission.type";

export interface ReadPermission {
    id: uuid;
    userStoryId: uuid;
    readModel: string;
    fields: ReadModelFieldPermissions | true;
    filter?: string;
}
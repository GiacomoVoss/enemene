import {uuid} from "../../../../base/type/uuid.type";
import {ReadModelFieldPermissions} from "../type/read-model-permission.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModel} from "../class/read-model.class";
import {AbstractFilter} from "../../filter";

export interface ReadPermission {
    id: uuid;
    userStoryId: uuid;
    readModel: ConstructorOf<ReadModel>;
    fields: ReadModelFieldPermissions | true;
    filter?: AbstractFilter;
}
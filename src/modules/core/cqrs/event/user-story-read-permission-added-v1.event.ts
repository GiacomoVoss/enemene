import {uuid} from "../../../../base/type/uuid.type";
import {ReadModelFieldPermissions} from "../type/read-model-permission.type";
import {AbstractEvent} from "../class/abstract-event.class";

export class UserStoryReadPermissionAddedV1Event extends AbstractEvent {

    constructor(public userStoryId: uuid,
                public permissionId: uuid,
                public readModel: string,
                public fields?: ReadModelFieldPermissions,
                public filter?: string) {
        super();
    }
}
import {AbstractEvent} from "../class/abstract-event.class";
import {uuid} from "../../../../base/type/uuid.type";

export class UserStoryReadPermissionRemovedV1Event extends AbstractEvent {

    constructor(public userStoryId: uuid,
                public permissionId: uuid) {
        super();
    }
}
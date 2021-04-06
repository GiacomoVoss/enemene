import {uuid} from "../../../../base/type/uuid.type";
import {AbstractEvent} from "../class/abstract-event.class";

export class UserStoryCommandPermissionAddedV1Event extends AbstractEvent {

    constructor(public userStoryId: uuid,
                public permissionId: uuid,
                public endpoint: string,
                public filter?: string) {
        super();
    }
}
import {AbstractEvent} from "../class/abstract-event.class";

export class UserStoryUnassignedFromRoleV1Event extends AbstractEvent {

    constructor(public userStoryId,
                public roleId) {
        super();
    }
}
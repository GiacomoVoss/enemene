import {AbstractEvent} from "../class/abstract-event.class";

export class UserStoryAssignedToRoleV1Event extends AbstractEvent {

    constructor(public userStoryId,
                public roleId) {
        super();
    }
}
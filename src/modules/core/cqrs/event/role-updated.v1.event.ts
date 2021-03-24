import {AbstractEvent} from "../class/abstract-event.class";

export class RoleUpdatedV1Event extends AbstractEvent {

    constructor(public newName: string) {
        super();
    }
}
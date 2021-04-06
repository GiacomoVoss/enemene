import {AbstractEvent} from "../class/abstract-event.class";

export class RoleUpdatedV1Event extends AbstractEvent {

    constructor(public name: string) {
        super();
    }
}
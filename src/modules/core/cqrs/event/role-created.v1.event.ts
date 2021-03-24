import {AbstractEvent} from "../class/abstract-event.class";

export class RoleCreatedV1Event extends AbstractEvent {

    constructor(public name: string) {
        super();
    }
}
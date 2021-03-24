import {AbstractEvent} from "../class/abstract-event.class";

export class UserStoryCreatedV1Event extends AbstractEvent {

    constructor(public name: string) {
        super();
    }

}
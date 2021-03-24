import {sortBy} from "lodash";

export class AbstractEvent {

    populate(data?: any) {
        if (data) {
            sortBy(Object.getOwnPropertyNames(this)).forEach(key => {
                this[key] = data[key];
            });
        }
    }
}
import {sortBy} from "lodash";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";

export class AbstractEvent {


    populate(data?: any) {
        if (data) {
            sortBy(Object.getOwnPropertyNames(this)).forEach(key => {
                this[key] = data[key];
            });
            this.replaceDates(this);
        }
    }

    private replaceDates(object: any, recurse: boolean = true): void {
        Object.keys(object).forEach((key: string) => {
            const value: serializable = object[key] as serializable;
            if (value !== null && value !== undefined) {
                if (typeof value === "object") {
                    // If the property represents an object and recursion is requested, recurse.
                    if (recurse) {
                        this.replaceDates(value as Dictionary<serializable>, recurse);
                    }
                } else if (typeof value === "string") {
                    // If the property represents a string, check if this string is a date. If so, transform it into a real date.
                    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                        object[key] = new Date(value);
                    }
                }
            }
        });
    }
}
import {sortBy} from "lodash";

export abstract class AbstractCommand {

    abstract $endpoint: string;

    public populate(data?: any): void {
        if (data) {
            sortBy(Object.getOwnPropertyNames(this)).forEach(key => {
                this[key] = data[key];
            });
        }
    }

    public validate(): void {
    }
}
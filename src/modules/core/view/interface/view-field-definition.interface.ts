import {DataObject} from "../../model";
import {View} from "../class/view.class";

export class ViewFieldDefinition<ENTITY extends DataObject<ENTITY>> {
    constructor(public name: string,
                public position: number,
                public subView?: new () => View<any>) {
    }

    toJSON() {
        return {
            position: this.position,
            name: this.name,
            subView: this.subView ? this.subView.name : undefined,
        };
    }
}

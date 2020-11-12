import {DataObject} from "../../model";
import {View} from "../class/view.class";
import {ConstructorOf} from "../../../../base/constructor-of";

export class ViewFieldDefinition<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>> {
    constructor(public name: keyof View<ENTITY>,
                public position: number,
                public fieldType?: any,
                public subView?: ConstructorOf<View<SUBENTITY>>,
                public isArray: boolean = false,
                public isCount: boolean = false) {
    }

    toJSON() {
        return {
            position: this.position,
            name: this.name,
            subView: this.subView?.name,
            isArray: this.isArray,
            isCount: this.isCount,
        };
    }
}

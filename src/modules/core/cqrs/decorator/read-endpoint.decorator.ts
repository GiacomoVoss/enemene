import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModel} from "../class/read-model.class";
import {AbstractFilter} from "../../filter";

export function ReadEndpoint(isPublic: boolean = false, filter?: AbstractFilter): Function {
    return (target: ConstructorOf<ReadModel>): void => {
        target.prototype.$endpoint = target.name;
        target.prototype.$isPublic = isPublic;
        target.prototype.$filter = filter;
    };
}
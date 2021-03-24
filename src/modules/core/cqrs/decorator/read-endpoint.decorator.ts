import {ConstructorOf} from "../../../../base/constructor-of";
import {ReadModel} from "../class/read-model.class";

export function ReadEndpoint(target: ConstructorOf<ReadModel>): void {
    target.prototype.$endpoint = target.name;
}
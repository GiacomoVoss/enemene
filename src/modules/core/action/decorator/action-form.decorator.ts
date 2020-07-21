import {RegisterActionParameter} from "./action-parameter.decorator";
import {ActionParameterType} from "../enum/parameter-type.enum";
import {View} from "../../view";

export function ActionInput(view: View<any>) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterActionParameter(ActionParameterType.INPUT, {
            view,
        })(target, propertyKey, parameterIndex);
    };
}

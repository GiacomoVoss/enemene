import {RegisterActionParameter} from "./action-parameter.decorator";
import {ActionParameterType} from "../enum/parameter-type.enum";
import {View} from "../../view";
import {ConstructorOf} from "../../../../base/constructor-of";

export function ActionInput(label: string, view: ConstructorOf<View<any>>) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterActionParameter(label, ActionParameterType.INPUT, {
            view: view,
            viewName: view.name,
        })(target, propertyKey, parameterIndex);
    };
}

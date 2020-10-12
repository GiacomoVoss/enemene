import {RegisterActionParameter} from "./action-parameter.decorator";
import {ActionParameterType} from "../enum/parameter-type.enum";
import {View} from "../../view";
import {ConstructorOf} from "../../../../base/constructor-of";

export function ActionSelection(label: string, view: ConstructorOf<View<any>>, multiSelection: boolean = false) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterActionParameter(label, ActionParameterType.SELECTION, {
            view: view,
            viewName: view.name,
            multiSelection,
        })(target, propertyKey, parameterIndex);
    };
}

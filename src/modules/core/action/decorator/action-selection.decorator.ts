import {RegisterActionParameter} from "./action-parameter.decorator";
import {ActionParameterType} from "../enum/parameter-type.enum";
import {View} from "../../view";

export function ActionSelection(label: string, view: View<any>, multiSelection: boolean = false) {
    return function (target, propertyKey, parameterIndex: number): void {
        RegisterActionParameter(label, ActionParameterType.SELECTION, {
            view,
            multiSelection,
        })(target, propertyKey, parameterIndex);
    };
}

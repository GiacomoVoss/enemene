import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractAction} from "..";
import {RegisterParameter} from "../../router/decorator/parameter/parameter.decorator";
import {ActionParameterType} from "../enum/action-parameter-type.enum";

export function ActionInput(stepIndex: number): Function {
    return function (target: ConstructorOf<AbstractAction>, propertyKey: string, parameterIndex: number): void {
        RegisterParameter(ActionParameterType.INPUT, stepIndex)(target, propertyKey, parameterIndex);
    };
}

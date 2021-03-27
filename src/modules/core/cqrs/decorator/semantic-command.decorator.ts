import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractCommand} from "../class/abstract-command.class";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";

export function SemanticCommand(type: SemanticCommandType): Function {
    return function (target: ConstructorOf<AbstractCommand>): void {
        target.prototype.$semanticType = type;
    };
}
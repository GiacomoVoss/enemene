import {sortBy} from "lodash";
import {CommandParameterType} from "../enum/command-parameter-type.enum";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AbstractValidate} from "../../validation/class/abstract-validate.class";

export abstract class AbstractCommand {

    abstract $endpoint: string;
    $semanticType: SemanticCommandType;
    $parameters: CommandParameterType[];

    constructor(public $validation?: AbstractValidate) {
    }

    public populate(data?: any): void {
        if (data) {
            this.getPropertyNames().forEach(key => {
                this[key] = data[key];
            });
        }
    }

    private getPropertyNames(): string[] {
        return sortBy(Object.getOwnPropertyNames(this))
            .filter(key => !key.startsWith("$"));
    }

    public toJSON() {
        return this.getPropertyNames().reduce((result: Dictionary<serializable>, key: string) => {
            result[key] = this[key];
            return result;
        }, {});
    }
}
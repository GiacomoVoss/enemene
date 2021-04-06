import {AbstractCommand} from "../class/abstract-command.class";
import {SemanticCommand} from "../decorator/semantic-command.decorator";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";
import {Validate} from "../../validation/class/validate.class";

@SemanticCommand(SemanticCommandType.CREATE)
export class CreateRoleCommand extends AbstractCommand {

    $endpoint = "role.create";

    constructor(public name: string) {
        super(Validate.commandInput({name: "Role name"}));
    }
}
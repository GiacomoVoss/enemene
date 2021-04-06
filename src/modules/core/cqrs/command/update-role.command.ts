import {AbstractCommand} from "../class/abstract-command.class";
import {SemanticCommand} from "../decorator/semantic-command.decorator";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";
import {Validate} from "../../validation/class/validate.class";

@SemanticCommand(SemanticCommandType.UPDATE)
export class UpdateRoleCommand extends AbstractCommand {

    $endpoint = "role.update";

    constructor(public name: string) {
        super(Validate.commandInput({name: "Role name"}));
    }
}
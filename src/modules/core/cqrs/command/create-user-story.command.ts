import {AbstractCommand} from "../class/abstract-command.class";
import {SemanticCommand} from "../decorator/semantic-command.decorator";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";
import {Validate} from "../../validation/class/validate.class";

@SemanticCommand(SemanticCommandType.CREATE)
export class CreateUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.create";

    constructor(public name: string) {
        super(Validate.commandInput({name: "User story name"}));
    }
}
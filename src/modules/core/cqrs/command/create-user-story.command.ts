import {AbstractCommand} from "../class/abstract-command.class";

export class CreateUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.create";

    constructor(public name: string) {
        super();
    }
}
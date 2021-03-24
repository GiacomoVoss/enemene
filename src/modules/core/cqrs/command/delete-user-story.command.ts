import {AbstractCommand} from "../class/abstract-command.class";

export class DeleteUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.delete";
}
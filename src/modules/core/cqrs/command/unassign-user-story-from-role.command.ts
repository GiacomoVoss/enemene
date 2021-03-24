import {uuid} from "../../../../base/type/uuid.type";
import {AbstractCommand} from "../class/abstract-command.class";

export class UnassignUserStoryFromRoleCommand extends AbstractCommand {

    $endpoint = "role.userStory.unassign";

    constructor(public userStoryId: uuid) {
        super();
    }
}
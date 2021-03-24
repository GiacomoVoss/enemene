import {uuid} from "../../../../base/type/uuid.type";
import {ReadModelFieldPermissions} from "../type/read-model-permission.type";
import {AbstractCommand} from "../class/abstract-command.class";

export class AssignUserStoryToRoleCommand extends AbstractCommand {

    $endpoint = "role.userStory.assign";

    constructor(public userStoryId: uuid) {
        super();
    }
}
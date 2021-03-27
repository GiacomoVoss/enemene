import {uuid} from "../../../../base/type/uuid.type";
import {AbstractCommand} from "../class/abstract-command.class";
import {Validate} from "../../validation/class/validate.class";

export class UnassignUserStoryFromRoleCommand extends AbstractCommand {

    $endpoint = "role.userStory.unassign";

    constructor(public userStoryId: uuid) {
        super(Validate.requiredFields("userStoryId"));
    }
}
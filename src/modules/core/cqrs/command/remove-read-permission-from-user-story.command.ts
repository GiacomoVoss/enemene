import {AbstractCommand} from "../class/abstract-command.class";
import {uuid} from "../../../../base/type/uuid.type";
import {Validate} from "../../validation/class/validate.class";

export class RemoveReadPermissionFromUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.readPermission.remove";

    constructor(public permissionId: uuid) {
        super(Validate.commandInput({permissionId: "Permission ID"}));
    }

}
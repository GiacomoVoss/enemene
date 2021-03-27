import {AbstractCommand} from "../class/abstract-command.class";
import {uuid} from "../../../../base/type/uuid.type";
import {Validate} from "../../validation/class/validate.class";

export class RemoveReadPermissionFromUserStoryCommand extends AbstractCommand {

    $endpoint = "readPermission.delete";

    constructor(public permissionId: uuid) {
        super(Validate.requiredFields("permissionId"));
    }

}
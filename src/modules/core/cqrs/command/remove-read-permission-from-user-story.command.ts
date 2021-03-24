import {AbstractCommand} from "../class/abstract-command.class";
import {uuid} from "../../../../base/type/uuid.type";

export class RemoveReadPermissionFromUserStoryCommand extends AbstractCommand {

    $endpoint = "readPermission.delete";

    constructor(public permissionId: uuid) {
        super();
    }

}
import {uuid} from "../../../../base/type/uuid.type";
import {ReadModelFieldPermissions} from "../type/read-model-permission.type";
import {AbstractCommand} from "../class/abstract-command.class";

export class AddReadPermissionToUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.readPermission.create";

    constructor(public id: uuid,
                public readModel: string,
                public fields?: ReadModelFieldPermissions,
                public filter?: string) {
        super();
    }
}
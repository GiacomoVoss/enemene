import {uuid} from "../../../../base/type/uuid.type";
import {AbstractCommand} from "../class/abstract-command.class";
import {Validate} from "../../validation/class/validate.class";

export class AddCommandPermissionToUserStoryCommand extends AbstractCommand {

    $endpoint = "userStory.commandPermission.add";

    constructor(public id: uuid,
                public endpoint: string,
                public filter?: string) {
        super(Validate.commandInput({id: "Command permission ID", endpoint: "Command endpoint"}));
    }
}
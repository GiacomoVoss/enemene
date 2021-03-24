import {AbstractCommand} from "../class/abstract-command.class";

export class CreateRoleCommand extends AbstractCommand {

    $endpoint = "role.create";

    constructor(public name: string) {
        super();
    }
}
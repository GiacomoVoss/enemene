import {AbstractCommand} from "../class/abstract-command.class";

export class DeleteRoleCommand extends AbstractCommand {

    $endpoint = "role.delete";
}
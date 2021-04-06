import {AbstractCommand} from "../class/abstract-command.class";
import {uuid} from "../../../../base/type/uuid.type";

export interface CommandExecution<C extends AbstractCommand> {
    command: C;
    aggregateId: uuid;
}
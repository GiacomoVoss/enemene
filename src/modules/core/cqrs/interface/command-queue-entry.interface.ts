import {AbstractCommand} from "../class/abstract-command.class";
import {uuid} from "../../../../base/type/uuid.type";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";
import {Subject} from "rxjs";

export interface CommandQueueEntry {
    command: AbstractCommand;
    aggregateId: uuid;
    version?: number;
    context?: RequestContext<AbstractUserReadModel>;
    correlationId?: uuid;
    result: Subject<any>;
}
import {AggregateRepositoryService} from "./aggregate-repository.service";
import {EnemeneCqrs} from "../../application";
import {Aggregate} from "../class/aggregate.class";
import {AbstractCommand} from "../class/abstract-command.class";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {ObjectNotFoundError, UnsupportedOperationError} from "../../error";
import {AbstractEvent} from "../class/abstract-event.class";
import {EventRepositoryService} from "./event-repository.service";
import {UuidService} from "../../service/uuid.service";
import {ValidationService} from "../../validation/service/validation.service";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUserReadModel} from "../../auth";
import {SemanticCommandType} from "../enum/semantic-command-type.enum";
import {UserInputValidationError} from "../error/user-input-validation.error";
import {PermissionCqrsService} from "../../auth/service/permission-cqrs.service";
import {ObjectRepositoryService} from "./object-repository.service";
import {Observable, Subject} from "rxjs";
import {CommandQueueEntry} from "../interface/command-queue-entry.interface";
import {concatMap} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";
import {uuid} from "../../../../base/type/uuid.type";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {CommandResult} from "../interface/command-result.interface";

export class CommandBus {

    private aggregateRepository: AggregateRepositoryService = EnemeneCqrs.app.inject(AggregateRepositoryService);
    private permissionCqrsService: PermissionCqrsService = EnemeneCqrs.app.inject(PermissionCqrsService);
    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);
    private validationService: ValidationService = EnemeneCqrs.app.inject(ValidationService);
    private objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);

    public asyncResults: Dictionary<any> = {};

    private commandQueue: Subject<CommandQueueEntry> = new Subject();

    constructor() {
        this.commandQueue
            .pipe(concatMap(entry => fromPromise(this.executeCommandFromQueue(entry))))
            .subscribe();
    }

    public executeCommand(command: AbstractCommand, aggregateId: string, version?: number, correlationId?: uuid, context?: RequestContext<AbstractUserReadModel>): Observable<any> {
        EnemeneCqrs.log.silly(this.constructor.name, `Command: ${command.$endpoint} (${aggregateId})`);
        const result: Subject<any> = new Subject();
        this.commandQueue.next({
            command,
            aggregateId,
            version,
            context,
            result,
            correlationId,
        });

        return result;
    }

    private async executeCommandFromQueue(queueEntry: CommandQueueEntry): Promise<void> {
        await this.executeCommandInternal(queueEntry);
    }

    private async executeCommandInternal({command, aggregateId, version, context, result, correlationId}: CommandQueueEntry): Promise<any> {
        try {
            this.validateCommand(command, aggregateId, version, context);
        } catch (e) {
            result.error(e);
            return;
        }
        const aggregate: Aggregate = this.aggregateRepository.getAggregateForCommand(command.$endpoint, aggregateId);
        const commandHandler: CommandHandlerDefinition = aggregate.$commandHandlers.find(handler => handler.endpoint === command.$endpoint);
        if (!commandHandler) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }

        // Execute the command handler (which will not perform any changes on the aggregate itself but return the intended changes as events).
        let commandResult: CommandResult = {};
        let events: AbstractEvent | AbstractEvent[] | null;
        try {
            events = commandHandler.handler.apply(aggregate, [command, commandResult]);
        } catch (e) {
            result.error(e);
            return;
        }
        const eventList: AbstractEvent[] = Array.isArray(events) ? events : [events];
        if (commandResult.value) {
            result.next(commandResult.value);
        } else {
            result.complete();
        }

        if (events == null) {
            return;
        }

        const causationId: uuid = UuidService.getUuid();
        await this.eventRepository.persistEvents(eventList, aggregateId, causationId, correlationId ?? UuidService.getUuid(), context?.currentUser?.id, aggregate.version);
    }

    private validateCommand(command: AbstractCommand, aggregateId: string, aggregateVersion?: number, context?: RequestContext<AbstractUserReadModel>): uuid | undefined {
        this.validationService.validateCommand(command);
        const aggregate: Aggregate = this.aggregateRepository.getAggregateForCommand(command.$endpoint, aggregateId);
        const currentAggregateVersion: number = aggregate.version;

        if (context) {
            this.permissionCqrsService.checkCommandPermission(command.$endpoint, aggregate, context, this.objectRepository);
        }

        const commandHandler: CommandHandlerDefinition = aggregate.$commandHandlers.find(handler => handler.endpoint === command.$endpoint);
        if (!commandHandler) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }

        if (command.$semanticType === SemanticCommandType.CREATE) {
            // Create command with wrong version number? => 400
            if (currentAggregateVersion !== 0) {
                throw new UserInputValidationError("Objects can only be created with version 0");
            }
        } else {
            // Not a CreateCommand on a non existing object?
            if (currentAggregateVersion == 0) {
                throw new ObjectNotFoundError(`${command.$endpoint}, ${aggregateId}`);
            }

            // Optimistic locking version number mismatch?
            // if (aggregateVersion !== undefined && aggregate.version != aggregateVersion) {
            //     throw new UserInputValidationError("Optimistic locking error.");
            // }
        }

        if (aggregate.deleted && command.$semanticType !== SemanticCommandType.RESTORE) {
            // Not a RestoreCommand on a deleted object?
            throw new ObjectNotFoundError();
        }

        if (commandHandler.returnsAsyncResult) {
            return UuidService.getUuid();
        }

        return undefined;
    }
}
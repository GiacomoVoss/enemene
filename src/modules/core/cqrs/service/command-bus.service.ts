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

export class CommandBus {

    private aggregateRepository: AggregateRepositoryService = EnemeneCqrs.app.inject(AggregateRepositoryService);
    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);
    private validationService: ValidationService = EnemeneCqrs.app.inject(ValidationService);

    async executeCommand(command: AbstractCommand, aggregateId: string, aggregateVersion?: number, context?: RequestContext<AbstractUserReadModel>): Promise<void> {
        this.validationService.validateCommand(command, context);
        const aggregate: Aggregate = await this.aggregateRepository.getAggregateForCommand(command.$endpoint, aggregateId);
        if (!aggregate) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }
        const commandHandler: CommandHandlerDefinition = aggregate.$commandHandlers.find(handler => handler.endpoint === command.$endpoint);
        if (!commandHandler) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }

        if (command.$semanticType === SemanticCommandType.CREATE) {
            // Create command with wrong version number? => 400
            if (aggregateVersion !== undefined && aggregateVersion != 0) {
                throw new UserInputValidationError("Objects can only be created with version 0");
            }

            // CreateCommand on an already existing object? => 200
            if (aggregate.version != 0) {
                return;
            }
        } else {
            // Not a CreateCommand on a non existing object?
            if (aggregate.version == 0) {
                throw new ObjectNotFoundError();
            }

            // Optimistic locking version number mismatch?
            if (aggregateVersion !== undefined && aggregate.version != aggregateVersion) {
                throw new UserInputValidationError("Optimistic locking error.");
            }
        }

        // Execute the command handler (which will not perform any changes on the aggregate itself but return the intended
        // changes as events).
        let events: AbstractEvent | AbstractEvent[] | null = commandHandler.handler.apply(aggregate, [command]);
        const eventList: AbstractEvent[] = Array.isArray(events) ? events : [events];

        // Not a RestoreCommand on a deleted object?
        if (eventList.length && aggregate.deleted && command.$semanticType !== SemanticCommandType.RESTORE) {
            throw new ObjectNotFoundError();
        }

        if (events == null) {
            return;
        }

        await this.eventRepository.persistEvents(eventList, aggregateId, UuidService.getUuid());
    }
}
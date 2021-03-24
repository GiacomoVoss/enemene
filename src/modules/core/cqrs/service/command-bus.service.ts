import {AggregateRepositoryService} from "./aggregate-repository.service";
import {EnemeneCqrs} from "../../application";
import {Aggregate} from "../class/aggregate.class";
import {AbstractCommand} from "../class/abstract-command.class";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";
import {UnsupportedOperationError} from "../../error";
import {AbstractEvent} from "../class/abstract-event.class";
import {EventRepositoryService} from "./event-repository.service";
import {UuidService} from "../../service/uuid.service";

export class CommandBus {

    private aggregateRepository: AggregateRepositoryService = EnemeneCqrs.app.inject(AggregateRepositoryService);
    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);

    async executeCommand(command: AbstractCommand, aggregateId: string): Promise<void> {
        const aggregate: Aggregate = await this.aggregateRepository.getAggregateForCommand(command.$endpoint, aggregateId);
        if (!aggregate) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }
        const commandHandler: CommandHandlerDefinition = aggregate.$commandHandlers.find(handler => handler.endpoint === command.$endpoint);
        if (!commandHandler) {
            throw new UnsupportedOperationError("No command handler found: " + command.$endpoint);
        }

        let events: AbstractEvent | AbstractEvent[] | null = commandHandler.handler.apply(aggregate, [command]);
        if (events == null) {
            return;
        }

        const eventList: AbstractEvent[] = Array.isArray(events) ? events : [events];
        await this.eventRepository.persistEvents(eventList, aggregateId, UuidService.getUuid());
    }
}
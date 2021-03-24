import {Aggregate} from "../class/aggregate.class";
import {AggregateRegistryService} from "./aggregate-registry.service";
import {EnemeneCqrs} from "../../application";
import {EventRepositoryService} from "./event-repository.service";
import {Event} from "../entity/event.model";
import {AbstractEvent} from "../class/abstract-event.class";
import {EventHandlerDefinition} from "../interface/event-handler-definition.interface";
import {EventRegistryService} from "./event-registry.service";

export class AggregateRepositoryService {

    private aggregateRegistryService: AggregateRegistryService = EnemeneCqrs.app.inject(AggregateRegistryService);
    private eventRepository: EventRepositoryService = EnemeneCqrs.app.inject(EventRepositoryService);
    private eventRegistry: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);

    async getAggregateForCommand(commandEndpoint: string, aggregateId: string): Promise<Aggregate> {
        const aggregate: Aggregate = this.aggregateRegistryService.getAggregateInstanceForCommand(commandEndpoint);
        aggregate.id = aggregateId;
        await this.buildAggregate(aggregate);
        return aggregate;
    }

    async buildAggregate(aggregate: Aggregate): Promise<void> {
        const events: Event[] = await this.eventRepository.getAllEventsForAggregateId(aggregate.id);
        events.forEach(event => this.handleEvent(aggregate, event));
    }

    public handleEvent(aggregate: Aggregate, metadata: Event) {
        const event: AbstractEvent = this.eventRegistry.parseEvent(metadata);
        const handler: EventHandlerDefinition = aggregate.$eventHandlers.find(h => h.eventTypeName === metadata.eventType);
        handler.handler.apply(aggregate, [event, metadata]);
    }
}
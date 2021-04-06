import {Aggregate} from "../class/aggregate.class";
import {AggregateRegistryService} from "./aggregate-registry.service";
import {EnemeneCqrs} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {set} from "lodash";
import {AbstractEvent} from "../class/abstract-event.class";
import {Event} from "../entity/event.model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {UnsupportedOperationError} from "../../error";

export class AggregateRepositoryService {

    private aggregateRegistryService: AggregateRegistryService = EnemeneCqrs.app.inject(AggregateRegistryService);
    private aggregates: Dictionary<Dictionary<Aggregate>> = {};

    get aggregatesById(): Dictionary<Aggregate> {
        return Object.values(this.aggregates).reduce((result: Dictionary<Aggregate>, map: Dictionary<Aggregate>) => {
            return {
                ...result,
                ...map,
            };
        }, {});
    }

    getAggregateForCommand(commandEndpoint: string, aggregateId: string): Aggregate {
        const aggregateName: string = this.aggregateRegistryService.getAggregateClassForCommand(commandEndpoint)?.name;
        if (!aggregateName) {
            throw new UnsupportedOperationError("No command handler found: " + commandEndpoint);
        }
        if (!this.aggregates[aggregateName]?.[aggregateId]) {
            set(this.aggregates, `${aggregateName}.${aggregateId}`, this.aggregateRegistryService.getAggregateInstance(aggregateName));
        }
        const aggregate: Aggregate = this.aggregates[aggregateName][aggregateId];
        aggregate.id = aggregateId;
        return aggregate;
    }

    public handleEvent(event: AbstractEvent, metadata: Event) {
        const aggregate: Aggregate = this.getAggregateForEvent(metadata);
        if (aggregate) {
            aggregate.handleEvent(metadata);
        }
    }

    private getAggregateForEvent(event: Event): Aggregate {
        const aggregateClass: ConstructorOf<Aggregate> = this.aggregateRegistryService.getAggregateClassForEvent(event.eventType);
        if (!aggregateClass) {
            return undefined;
        }
        if (!this.aggregates[aggregateClass.name]?.[event.aggregateId]) {
            set(this.aggregates, `${aggregateClass.name}.${event.aggregateId}`, this.aggregateRegistryService.getAggregateInstance(aggregateClass.name));
        }
        const aggregate: Aggregate = this.aggregates[aggregateClass.name][event.aggregateId];
        aggregate.id = event.aggregateId;
        return aggregate;
    }
}
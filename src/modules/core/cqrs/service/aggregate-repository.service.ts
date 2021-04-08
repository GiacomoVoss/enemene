import {Aggregate} from "../class/aggregate.class";
import {AggregateRegistryService} from "./aggregate-registry.service";
import {EnemeneCqrs} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {set} from "lodash";
import {AbstractEvent} from "../class/abstract-event.class";
import {Event} from "../entity/event.model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {UnsupportedOperationError} from "../../error";
import {uuid} from "../../../../base/type/uuid.type";
import {Transaction} from "sequelize";
import {WhereOptions} from "sequelize/types/lib/model";

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

    async getAggregateForCommand(commandEndpoint: string, aggregateId: string): Promise<Aggregate> {
        const aggregateName: string = this.aggregateRegistryService.getAggregateClassForCommand(commandEndpoint)?.name;
        if (!aggregateName) {
            throw new UnsupportedOperationError("No command handler found: " + commandEndpoint);
        }
        if (!this.aggregates[aggregateName]?.[aggregateId]) {
            set(this.aggregates, `${aggregateName}.${aggregateId}`, this.aggregateRegistryService.getAggregateInstance(aggregateName));
        }
        const aggregate: Aggregate = this.aggregates[aggregateName][aggregateId];
        aggregate.id = aggregateId;
        const events: Event[] = await this.getAllEventsForAggregateId(aggregateName, aggregateId);
        events.forEach(event => aggregate.handleEvent(event));
        return aggregate;
    }

    public async getAllEventsForAggregateId(aggregateName: string, id: uuid, offset?: number, transaction?: Transaction): Promise<Event[]> {
        const where: WhereOptions = {
            aggregateId: id,
        };
        return Event.findAll<Event>({
            order: [["position", "ASC"]],
            offset: offset,
            where,
            transaction,
        });
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
        return this.aggregates[aggregateClass.name]?.[event.aggregateId];
    }
}
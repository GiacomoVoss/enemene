import {Event} from "../entity/event.model";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractEvent} from "../class/abstract-event.class";
import {Enemene, EnemeneCqrs} from "../../application";
import {Subject} from "rxjs";
import {ReadModelRepositoryService} from "./read-model-repository.service";
import {Transaction} from "sequelize";
import {UuidService} from "../../service/uuid.service";
import {EventRegistryService} from "./event-registry.service";

export class EventRepositoryService {

    private eventRegistry: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);

    latestPosition: number = 0;
    public queue = new Subject<Event>();

    public async startEventListener(): Promise<void> {
        const repository = Enemene.app.inject(ReadModelRepositoryService);
        this.queue.subscribe({
            next: event => repository.handleEvent(this.eventRegistry.parseEvent(event), event)
        });
        const events: Event[] = await this.getAllEventsUntilNow();
        events.forEach(event => this.queue.next(event));
    }

    public async getAllEventsUntilNow(): Promise<Event[]> {
        return Event.findAll({
            order: [["position", "ASC"]],
        }).then(events => {
            this.latestPosition = events.length - 1;
            return events;
        });
    }

    public async getAllEventsForAggregateId(id: uuid): Promise<Event[]> {
        return Event.findAll({
            order: [["position", "ASC"]],
            where: {
                aggregateId: id,
            }
        });
    }

    public async persistEvents(events: AbstractEvent[], aggregateId: uuid, causationId: uuid): Promise<void> {
        const transaction: Transaction = await Enemene.app.db.transaction({
            type: Transaction.TYPES.IMMEDIATE,
        });
        let position: number = this.latestPosition;
        const eventsToPersist: Event[] = events.map((event: AbstractEvent) => {
            position++;
            return Event.build({
                position,
                id: UuidService.getUuid(),
                eventType: event.constructor.name,
                aggregateId,
                data: event,
            });
        });
        eventsToPersist.forEach(this.queue.next);
        try {
            await Event.bulkCreate(eventsToPersist, {
                transaction,
            });
        } catch (e) {
            console.log(e);
        }

        await transaction.commit();
        this.latestPosition = position;
    }
}
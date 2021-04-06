import {Event} from "../entity/event.model";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractEvent} from "../class/abstract-event.class";
import {Enemene, EnemeneCqrs} from "../../application";
import {Observable, Subject} from "rxjs";
import {ReadModelRepositoryService} from "./read-model-repository.service";
import {Op, Transaction} from "sequelize";
import {UuidService} from "../../service/uuid.service";
import {EventRegistryService} from "./event-registry.service";
import {Snapshot} from "../entity/snapshot.model";
import {WhereOptions} from "sequelize/types/lib/model";
import {ObjectRepositoryService} from "./object-repository.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {AggregateRepositoryService} from "./aggregate-repository.service";
import {ConstructorOf} from "../../../../base/constructor-of";
import {filter, map} from "rxjs/operators";

export class EventRepositoryService {

    private eventRegistry: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);
    private objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);

    public queue = new Subject<Event>();

    private latestPosition: number = 0;

    public async startEventListener(): Promise<void> {
        const readModelRepository = Enemene.app.inject(ReadModelRepositoryService);
        const aggregateRepository = Enemene.app.inject(AggregateRepositoryService);
        this.queue.subscribe({
            next: event => {
                EnemeneCqrs.log.debug(this.constructor.name, `Event ${event.position}: ${event.eventType} (${event.aggregateId})`);
                readModelRepository.handleEvent(this.eventRegistry.parseEvent(event), event);
                aggregateRepository.handleEvent(this.eventRegistry.parseEvent(event), event);

                this.latestPosition = event.position;
                if (event.position % 1000 === 0) {
                    this.createSnapshot(event.position);
                }
            }
        });

        // Apply latest snapshot.
        const latestSnapshot: Snapshot | null = await Snapshot.findOne({
            order: [["position", "DESC"]],
        });

        if (latestSnapshot) {
            EnemeneCqrs.log.info(this.constructor.name, `Rebuilding from Snapshot @ ${latestSnapshot.position}...`);
            this.objectRepository.deserializeSnapshot(latestSnapshot.data);
            this.latestPosition = latestSnapshot.position;
        }

        const events: Event[] = await this.getAllEventsFromPosition(this.latestPosition);
        if (events.length) {
            EnemeneCqrs.log.info(this.constructor.name, `Rebuilding from ${events.length} events...`);
        }
        events.forEach(event => {
            readModelRepository.handleEvent(this.eventRegistry.parseEvent(event), event);
            aggregateRepository.handleEvent(this.eventRegistry.parseEvent(event), event);
            this.latestPosition = event.position;
        });
        this.createSnapshot(this.latestPosition);
    }

    public listen(events: ConstructorOf<AbstractEvent>[], aggregateId?: uuid): Observable<[AbstractEvent, Event]> {
        const eventTypes: string[] = events.map(e => e.name);
        return this.queue
            .pipe(filter(event => eventTypes.includes(event.eventType)))
            .pipe(filter(event => aggregateId ? event.aggregateId === aggregateId : true))
            .pipe(map(event => [this.eventRegistry.parseEvent(event), event]));
    }

    public async getAllEventsFromPosition(fromPosition?: number): Promise<Event[]> {
        const where: WhereOptions = {};
        if (fromPosition) {
            where.position = {
                [Op.gt]: fromPosition,
            };
        }
        return Event.findAll({
            order: [["position", "ASC"]],
            where,
        });
    }

    public async getAllEventsForAggregateId(id: uuid, offset?: number, transaction?: Transaction): Promise<Event[]> {
        const where: WhereOptions = {
            aggregateId: id,
        };
        return Event.findAll({
            order: [["position", "ASC"]],
            offset: offset,
            where,
            transaction,
        });
    }

    public async persistEvents(events: AbstractEvent[], aggregateId: uuid, causationId: uuid, correlationId: uuid, causedByUserId: uuid, aggregateVersion: number): Promise<void> {
        const eventsToPersist: Event[] = events.map((event: AbstractEvent) => {
            return Event.build({
                id: UuidService.getUuid(),
                eventType: event.constructor.name,
                aggregateId,
                causationId,
                causedByUserId,
                correlationId,
                data: event,
            });
        });
        const transaction: Transaction = await Enemene.app.db.transaction();
        try {
            await Promise.all(eventsToPersist.map(async event => event.save({transaction})));
            eventsToPersist.forEach(event => this.queue.next(event));
            await transaction.commit();
            this.latestPosition = eventsToPersist.pop().position;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    private createSnapshot(position: number): void {
        if (position) {
            const id: uuid = UuidService.getUuid();
            Snapshot.findOne({
                where: {
                    position: {
                        [Op.gte]: position,
                    }
                }
            }).then(result => {
                if (!result) {
                    EnemeneCqrs.log.debug(this.constructor.name, `Creating snapshot @ ${position}.`);
                    const data: Dictionary<serializable> = this.objectRepository.serializeSnapshot();
                    Snapshot.create({
                        id,
                        position: position,
                        data,
                    }).then(() => {
                        Snapshot.sequelize.query(`DELETE FROM ${Snapshot.getTableName()} WHERE position < '${position}'`);
                    });
                }
            });
        }
    }
}
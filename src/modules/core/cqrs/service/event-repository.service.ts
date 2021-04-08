import {Event} from "../entity/event.model";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractEvent} from "../class/abstract-event.class";
import {Enemene, EnemeneCqrs} from "../../application";
import {Observable, Subject} from "rxjs";
import {ReadModelRepositoryService} from "./read-model-repository.service";
import {Op, Transaction} from "sequelize";
import {UuidService} from "../../service/uuid.service";
import {EventRegistryService} from "./event-registry.service";
import {WhereOptions} from "sequelize/types/lib/model";
import {ObjectRepositoryService} from "./object-repository.service";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {filter, map} from "rxjs/operators";
import {FileService} from "../../file/service/file.service";
import * as fs from "fs";
import path from "path";

export class EventRepositoryService {

    private eventRegistry: EventRegistryService = EnemeneCqrs.app.inject(EventRegistryService);
    private objectRepository: ObjectRepositoryService = EnemeneCqrs.app.inject(ObjectRepositoryService);
    private readModelRepository: ReadModelRepositoryService = Enemene.app.inject(ReadModelRepositoryService);

    public queue = new Subject<Event>();

    private latestPosition: number = 0;
    private latestSnapshotPosition: number = 0;
    private preloadPosition: number = 0;

    public async startEventListener(): Promise<void> {
        this.queue.subscribe({
            next: event => {
                EnemeneCqrs.log.debug(this.constructor.name, `Event ${event.position}: ${event.eventType} (${event.aggregateId})`);
                this.readModelRepository.handleEvent(this.eventRegistry.parseEvent(event), event);

                this.latestPosition = event.position;
                if (event.position > this.preloadPosition && event.position - this.latestSnapshotPosition > 1000) {
                    this.createSnapshot(event.position);
                }
            }
        });

        // Apply latest snapshot.
        const snapshotFilePositions: number[] = fs.readdirSync(path.join(FileService.DATA_PATH, "snapshots"))
            .filter(file => file.match(/s-\d+\.json/))
            .map(fileName => fileName.replace(/s-(\d+)\.json/, "$1"))
            .map(f => parseInt(f));
        snapshotFilePositions.sort();
        if (snapshotFilePositions.length) {
            const latestSnapshotFile: string = `s-${snapshotFilePositions.pop()}.json`;
            EnemeneCqrs.log.info(this.constructor.name, `Recreating events from snapshot ${latestSnapshotFile}`);
            const data = fs.readFileSync(path.join(FileService.DATA_PATH, "snapshots", latestSnapshotFile));
            const objectData = JSON.parse(data.toString("utf8"));
            this.objectRepository.deserializeSnapshot(objectData);
            this.latestPosition = parseInt(latestSnapshotFile.split(path.sep).pop().replace(/s-(\d*)\.json/, "$1"));
        }

        const events: Event[] = await this.getAllEventsFromPosition(this.latestPosition);
        if (events.length) {
            EnemeneCqrs.log.info(this.constructor.name, `Rebuilding from ${events.length} events...`);
            this.preloadPosition = events[events.length - 1].position;
        }
        events.forEach((event, index) => {
            this.queue.next(event);
        });
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

    private async createSnapshot(position: number): Promise<void> {
        if (position) {
            const fileName: string = path.join(FileService.DATA_PATH, "snapshots", `s-${position}.json`);
            if (fs.existsSync(fileName)) {
                return;
            }
            const data: Dictionary<serializable> = this.objectRepository.serializeSnapshot();
            EnemeneCqrs.log.debug(this.constructor.name, `Creating snapshot @ ${position}`);
            return new Promise(resolve => {
                fs.writeFile(fileName, JSON.stringify(data), {encoding: "utf8"}, () => {
                    this.latestSnapshotPosition = position;
                    resolve();
                });
            });
        }
    }
}
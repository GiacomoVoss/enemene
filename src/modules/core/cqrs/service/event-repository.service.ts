import {Event} from "../entity/event.model";
import {uuid} from "../../../../base/type/uuid.type";
import {AbstractEvent} from "../class/abstract-event.class";
import {UuidService} from "../../service/uuid.service";
import {Enemene} from "../../application";
import {Transaction} from "sequelize";

export class EventRepositoryService {

    latestPosition: number = 0;

    public async getAllEventsUntilNow(): Promise<Event[]> {
        return Event.findAll({
            order: [["position", "ASC"]],
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
        await Event.bulkCreate(events.map((event: AbstractEvent) => {
            position++;
            return {
                position,
                id: UuidService.getUuid(),
                eventType: event.constructor.name,
                aggregateId,
                data: event,
            };
        }), {
            transaction,
        });

        await transaction.commit();
        this.latestPosition = position;
    }
}
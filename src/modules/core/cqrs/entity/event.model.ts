import {DataObject, Entity} from "../../model";
import {uuid} from "../../../../base/type/uuid.type";

@Entity
export class Event extends DataObject<Event> implements Event {

    position: number;

    eventType: string;

    aggregateId: uuid;

    data: any;

    createdAt: Date;

    correlationId?: string;

    causationId?: string;

    causedByUserId?: string;
}
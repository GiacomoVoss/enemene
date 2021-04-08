import {DataObject} from "../../model";
import {uuid} from "../../../../base/type/uuid.type";

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
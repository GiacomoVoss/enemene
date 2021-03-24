import {ConstructorOf, uuid} from "../base";
import {DataObject} from "../model";

export function EventHandler(eventType: ConstructorOf<AbstractEvent>, global?: boolean): Function;

export class AbstractEvent {
}

export interface EventMetadata {
    eventType: string;

    aggregateId: uuid;

    correlationId?: string;

    causationId?: string;

    causedByPersonId?: string;
}

export declare class Event extends DataObject<Event> implements EventMetadata {

    position: number;

    eventType: string;

    aggregateId: uuid;

    createdAt: string;

    data: any;

    correlationId?: string;
    causationId?: string;
    causedByPersonId?: string;
}
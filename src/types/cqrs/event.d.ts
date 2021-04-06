import {ConstructorOf, uuid} from "../base";
import {DataObject} from "../model";
import {Observable} from "rxjs";

export declare function EventHandler<T extends AbstractEvent>(eventType: ConstructorOf<T>, idExtractor?: (event: T) => uuid): Function;
export declare function EventHandler<T extends AbstractEvent>(eventType: ConstructorOf<T>, global?: true): Function;

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

    createdAt: Date;

    data: any;

    correlationId?: string;
    causationId?: string;
    causedByPersonId?: string;
}


export declare class EventRepositoryService {

    public listen(events: ConstructorOf<AbstractEvent>[], aggregateId?: uuid): Observable<[AbstractEvent, Event]>;
}
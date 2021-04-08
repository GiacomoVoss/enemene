import {ConstructorOf, uuid} from "../base";
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

    causedByUserId?: string;

    createdAt: Date;
}

export declare class EventRepositoryService {

    public listen(events: ConstructorOf<AbstractEvent>[], aggregateId?: uuid): Observable<[AbstractEvent, EventMetadata]>;
}
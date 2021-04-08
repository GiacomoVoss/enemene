import {uuid} from "../../../../base/type/uuid.type";

export interface EventMetadata {
    eventType: string;

    aggregateId: uuid;

    correlationId?: string;

    causationId?: string;

    causedByUserId?: string;
}
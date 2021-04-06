import {uuid} from "../../../../base/type/uuid.type";

export interface CommandPermission {
    id: uuid;
    userStoryId: uuid;
    endpoint: string;
    filter?: string;
}
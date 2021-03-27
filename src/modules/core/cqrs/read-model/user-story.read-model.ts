import {ReadModel} from "../class/read-model.class";
import {AbstractFilter, Filter} from "../../filter";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractCommand} from "../class/abstract-command.class";
import {EventHandler} from "../decorator/event-handler.decorator";
import {UserStoryCreatedV1Event, UserStoryDeletedV1Event, UserStoryReadPermissionAddedV1Event, UserStoryReadPermissionRemovedV1Event} from "../event";
import {EventMetadata} from "../interface/event-metadata.interface";
import {ReadPermission} from "../interface/read-permission.interface";
import {ReadModelRegistryService} from "../service/read-model-registry.service";
import {EnemeneCqrs} from "../../application";
import {ReadEndpoint} from "../decorator/read-endpoint.decorator";

@ReadEndpoint
export class UserStory extends ReadModel {

    public name: string;

    public readModelPermissions: ReadPermission[] = [];

    public commandPermissions: {
        command: ConstructorOf<AbstractCommand>;
        filter?: AbstractFilter;
    };

    @EventHandler(UserStoryCreatedV1Event)
    handleCreated(event: UserStoryCreatedV1Event) {
        this.name = event.name;
    }

    @EventHandler(UserStoryDeletedV1Event)
    handleDeleted() {
        this.deleted = true;
    }

    @EventHandler(UserStoryReadPermissionAddedV1Event, event => event.userStoryId)
    handleReadPermissionCreated(event: UserStoryReadPermissionAddedV1Event, metadata: EventMetadata) {
        const newReadPermission: ReadPermission = {
            id: event.permissionId,
            userStoryId: this.id,
            readModel: EnemeneCqrs.app.inject(ReadModelRegistryService).getReadModelConstructor(event.readModel),
            fields: event.fields ?? true,
            filter: Filter.true()
        };
        this.readModelPermissions.push(newReadPermission);
    }

    @EventHandler(UserStoryReadPermissionRemovedV1Event, event => event.userStoryId)
    handleReadPermissionDeleted(event: UserStoryReadPermissionRemovedV1Event, metadata: EventMetadata) {
        this.readModelPermissions.filter(p => p.id !== metadata.aggregateId);
    }
}
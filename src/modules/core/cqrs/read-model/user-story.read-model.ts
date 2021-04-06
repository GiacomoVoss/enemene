import {ReadModel} from "../class/read-model.class";
import {EventHandler} from "../decorator/event-handler.decorator";
import {UserStoryCreatedV1Event, UserStoryDeletedV1Event, UserStoryReadPermissionAddedV1Event, UserStoryReadPermissionRemovedV1Event} from "../event";
import {ReadPermission} from "../interface/read-permission.interface";
import {UserStoryCommandPermissionAddedV1Event} from "../event/user-story-command-permission-added-v1.event";
import {UserStoryCommandPermissionRemovedV1Event} from "../event/user-story-command-permission-removed-v1.event";
import {CommandPermission} from "../interface/command-permission.interface";

export class UserStory extends ReadModel {

    public name: string;

    public readModelPermissions: ReadPermission[] = [];

    public commandPermissions: CommandPermission[] = [];

    @EventHandler(UserStoryCreatedV1Event)
    handleCreated(event: UserStoryCreatedV1Event) {
        this.name = event.name;
    }

    @EventHandler(UserStoryDeletedV1Event)
    handleDeleted() {
        this.deleted = true;
    }

    @EventHandler(UserStoryReadPermissionAddedV1Event)
    handleReadPermissionCreated(event: UserStoryReadPermissionAddedV1Event) {
        this.readModelPermissions.push({
            id: event.permissionId,
            userStoryId: this.id,
            readModel: event.readModel,
            fields: event.fields ?? true,
            filter: event.filter,
        });
    }

    @EventHandler(UserStoryReadPermissionRemovedV1Event)
    handleReadPermissionRemoved(event: UserStoryReadPermissionRemovedV1Event) {
        this.readModelPermissions.filter(p => p.id !== event.permissionId);
    }

    @EventHandler(UserStoryCommandPermissionAddedV1Event)
    handleCommandPermissionAdded(event: UserStoryCommandPermissionAddedV1Event) {
        this.commandPermissions.push({
            id: event.permissionId,
            userStoryId: this.id,
            endpoint: event.endpoint,
            filter: event.filter,
        });
    }


    @EventHandler(UserStoryCommandPermissionRemovedV1Event)
    handleCommandPermissionRemoved(event: UserStoryCommandPermissionRemovedV1Event) {
        this.commandPermissions = this.commandPermissions.filter(p => p.id !== event.permissionId);
    }
}
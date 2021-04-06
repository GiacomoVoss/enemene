import {EventHandler} from "../decorator/event-handler.decorator";
import {RoleCreatedV1Event, RoleDeletedV1Event, RoleUpdatedV1Event, UserStoryAssignedToRoleV1Event, UserStoryDeletedV1Event, UserStoryUnassignedFromRoleV1Event} from "../event";
import {EventMetadata} from "../interface/event-metadata.interface";
import {UserStory} from "./user-story.read-model";
import {ReadPermission} from "../interface/read-permission.interface";
import {ReadEndpoint} from "../decorator/read-endpoint.decorator";
import {ReadModel} from "../class/read-model.class";
import {CommandPermission} from "../interface/command-permission.interface";

@ReadEndpoint
export class RoleReadModel extends ReadModel {

    public name: string;

    public userStories: UserStory[] = [];

    public get readModelPermissions(): ReadPermission[] {
        return this.userStories.map(userStory => userStory.readModelPermissions)
            .reduce((result: ReadPermission[], permissions: ReadPermission[]) => {
                result.push(...permissions);
                return result;
            }, []);
    }

    public get commandPermissions(): CommandPermission[] {
        return this.userStories.map(userStory => userStory.commandPermissions)
            .reduce((result: CommandPermission[], permissions: CommandPermission[]) => {
                result.push(...permissions);
                return result;
            }, []);
    }

    @EventHandler(RoleCreatedV1Event)
    handleCreated(event: RoleCreatedV1Event) {
        this.name = event.name;
    }

    @EventHandler(RoleDeletedV1Event)
    handleDeleted() {
        this.deleted = true;
    }

    @EventHandler(RoleUpdatedV1Event)
    handleUpdated(event: RoleUpdatedV1Event) {
        this.name = event.name;
    }

    @EventHandler(UserStoryAssignedToRoleV1Event)
    handleUserStoryAssigned(event: UserStoryAssignedToRoleV1Event) {
        const userStory: UserStory = this.resolveObjectReference(UserStory, event.userStoryId);
        this.userStories.push(userStory);
    }

    @EventHandler(UserStoryUnassignedFromRoleV1Event)
    handleUserStoryUnassigned(event: UserStoryUnassignedFromRoleV1Event) {
        this.userStories = this.userStories.filter(userStory => userStory.id !== event.userStoryId);
    }

    @EventHandler(UserStoryDeletedV1Event, true)
    handleUserStoryDeleted(event: UserStoryDeletedV1Event, metadata: EventMetadata) {
        this.userStories = this.userStories.filter(userStory => userStory.id !== metadata.aggregateId);
    }
}
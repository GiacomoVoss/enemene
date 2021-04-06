import {Aggregate} from "../class/aggregate.class";
import {CommandHandler} from "../decorator/command-handler.decorator";
import {CreateRoleCommand} from "../command/create-role.command";
import {RoleCreatedV1Event, RoleDeletedV1Event, RoleUpdatedV1Event, UserStoryAssignedToRoleV1Event, UserStoryDeletedV1Event, UserStoryUnassignedFromRoleV1Event} from "../event";
import {DeleteRoleCommand} from "../command/delete-role.command";
import {EventHandler} from "../decorator/event-handler.decorator";
import {AssignUserStoryToRoleCommand} from "../command/assign-user-story-to-role.command";
import {UnassignUserStoryFromRoleCommand} from "../command";
import {EventMetadata} from "../interface/event-metadata.interface";
import {UpdateRoleCommand} from "../command/update-role.command";

export class RoleAggregate extends Aggregate {

    public name: string;

    public userStoryIds: string[] = [];

    @CommandHandler(CreateRoleCommand)
    create(command: CreateRoleCommand) {
        return new RoleCreatedV1Event(command.name);
    }

    @EventHandler(RoleCreatedV1Event)
    handleCreate(event: RoleCreatedV1Event) {
        this.name = event.name;
    }

    @CommandHandler(DeleteRoleCommand)
    delete() {
        return new RoleDeletedV1Event();
    }

    @EventHandler(RoleDeletedV1Event)
    handleDelete() {
        this.deleted = true;
    }

    @CommandHandler(UpdateRoleCommand)
    update(command: UpdateRoleCommand) {
        if (this.name === command.name) {
            return null;
        }

        return new RoleUpdatedV1Event(command.name);
    }
    
    @EventHandler(RoleUpdatedV1Event)
    handleUpdated(event: RoleUpdatedV1Event) {
        this.name = event.name;
    }

    @CommandHandler(AssignUserStoryToRoleCommand)
    assignUserStory(command: AssignUserStoryToRoleCommand) {
        if (this.userStoryIds.includes(command.userStoryId)) {
            return null;
        }
        return new UserStoryAssignedToRoleV1Event(command.userStoryId, this.id);
    }

    @EventHandler(UserStoryAssignedToRoleV1Event)
    handleUserStoryAssigned(event: UserStoryAssignedToRoleV1Event) {
        this.userStoryIds.push(event.userStoryId);
    }

    @CommandHandler(UnassignUserStoryFromRoleCommand)
    unassignUserStory(command: UnassignUserStoryFromRoleCommand) {
        if (!this.userStoryIds.includes(command.userStoryId)) {
            return null;
        }
        return new UserStoryUnassignedFromRoleV1Event(command.userStoryId, this.id);
    }

    @EventHandler(UserStoryUnassignedFromRoleV1Event)
    handleUserStoryUnassigned(event: UserStoryUnassignedFromRoleV1Event) {
        this.userStoryIds = this.userStoryIds.filter(id => id !== event.userStoryId);
    }

    @EventHandler(UserStoryDeletedV1Event, true)
    handleUserStoryDeleted(event: UserStoryDeletedV1Event, metadata: EventMetadata) {
        this.userStoryIds = this.userStoryIds.filter(id => id !== metadata.aggregateId);
    }
}
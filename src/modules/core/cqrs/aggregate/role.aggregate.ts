import {Aggregate} from "../class/aggregate.class";
import {CommandHandler} from "../decorator/command-handler.decorator";
import {CreateRoleCommand} from "../command/create-role.command";
import {RoleCreatedV1Event, RoleDeletedV1Event, UserStoryAssignedToRoleV1Event, UserStoryDeletedV1Event, UserStoryUnassignedFromRoleV1Event} from "../event";
import {DeleteRoleCommand} from "../command/delete-role.command";
import {EventHandler} from "../decorator/event-handler.decorator";
import {AssignUserStoryToRoleCommand} from "../command/assign-user-story-to-role.command";
import {UnassignUserStoryFromRoleCommand} from "../command";
import {EventMetadata} from "../interface/event-metadata.interface";

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
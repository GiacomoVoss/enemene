import {Aggregate} from "../class/aggregate.class";
import {CreateUserStoryCommand} from "../command/create-user-story.command";
import {CommandHandler} from "../decorator/command-handler.decorator";
import {UserStoryCreatedV1Event} from "../event/user-story-created.v1.event";
import {DeleteUserStoryCommand} from "../command/delete-user-story.command";
import {UserStoryDeletedV1Event} from "../event/user-story-deleted.v1.event";
import {EventHandler} from "../decorator/event-handler.decorator";
import {AddReadPermissionToUserStoryCommand, RemoveReadPermissionFromUserStoryCommand} from "../command";
import {IntegrityViolationError} from "../../error";
import {UserStoryReadPermissionAddedV1Event, UserStoryReadPermissionRemovedV1Event} from "../event";

export class UserStoryAggregate extends Aggregate {

    public name: string;

    public readPermissionIds: string[] = [];

    @CommandHandler(CreateUserStoryCommand)
    create(command: CreateUserStoryCommand) {
        return new UserStoryCreatedV1Event(command.name);
    }

    @EventHandler(UserStoryCreatedV1Event)
    handleCreated(event: UserStoryCreatedV1Event) {
        this.name = event.name;
    }

    @CommandHandler(DeleteUserStoryCommand)
    delete() {
        return new UserStoryDeletedV1Event();
    }

    @EventHandler(UserStoryDeletedV1Event)
    handleDeleted() {
        this.deleted = true;
    }

    @CommandHandler(AddReadPermissionToUserStoryCommand)
    addPermission(command: AddReadPermissionToUserStoryCommand) {
        if (this.readPermissionIds.includes(command.id)) {
            throw new IntegrityViolationError();
        }
        return new UserStoryReadPermissionAddedV1Event(this.id, command.id, command.readModel, command.fields, command.filter);
    }

    @EventHandler(UserStoryReadPermissionAddedV1Event)
    handleReadPermissionAdded(event: UserStoryReadPermissionAddedV1Event) {
        this.readPermissionIds.push(event.permissionId);
    }

    @CommandHandler(RemoveReadPermissionFromUserStoryCommand)
    removePermission(command: RemoveReadPermissionFromUserStoryCommand) {
        if (!this.readPermissionIds.includes(command.permissionId)) {
            return null;
        }
        return new UserStoryReadPermissionRemovedV1Event(this.id, command.permissionId);
    }

    @EventHandler(UserStoryReadPermissionAddedV1Event)
    handleReadPermissionRemoved(event: UserStoryReadPermissionAddedV1Event) {
        this.readPermissionIds = this.readPermissionIds.filter(id => id !== event.permissionId);
    }
}
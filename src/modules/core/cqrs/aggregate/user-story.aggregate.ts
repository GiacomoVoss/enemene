import {Aggregate} from "../class/aggregate.class";
import {CreateUserStoryCommand} from "../command/create-user-story.command";
import {CommandHandler} from "../decorator/command-handler.decorator";
import {UserStoryCreatedV1Event} from "../event/user-story-created.v1.event";
import {DeleteUserStoryCommand} from "../command/delete-user-story.command";
import {UserStoryDeletedV1Event} from "../event/user-story-deleted.v1.event";
import {EventHandler} from "../decorator/event-handler.decorator";
import {AddCommandPermissionToUserStoryCommand, AddReadPermissionToUserStoryCommand, RemoveCommandPermissionFromUserStoryCommand, RemoveReadPermissionFromUserStoryCommand} from "../command";
import {IntegrityViolationError} from "../../error";
import {UserStoryReadPermissionAddedV1Event, UserStoryReadPermissionRemovedV1Event} from "../event";
import {UserStoryCommandPermissionRemovedV1Event} from "../event/user-story-command-permission-removed-v1.event";
import {UserStoryCommandPermissionAddedV1Event} from "../event/user-story-command-permission-added-v1.event";

export class UserStoryAggregate extends Aggregate {

    public name: string;

    public readPermissionIds: string[] = [];
    public commandPermissionIds: string[] = [];

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
    addReadPermission(command: AddReadPermissionToUserStoryCommand) {
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
    removeReadPermission(command: RemoveReadPermissionFromUserStoryCommand) {
        if (!this.readPermissionIds.includes(command.permissionId)) {
            return null;
        }
        return new UserStoryReadPermissionRemovedV1Event(this.id, command.permissionId);
    }

    @EventHandler(UserStoryReadPermissionRemovedV1Event)
    handleReadPermissionRemoved(event: UserStoryReadPermissionRemovedV1Event) {
        this.readPermissionIds = this.readPermissionIds.filter(id => id !== event.permissionId);
    }


    @CommandHandler(AddCommandPermissionToUserStoryCommand)
    addCommandPermission(command: AddCommandPermissionToUserStoryCommand) {
        if (this.commandPermissionIds.includes(command.id)) {
            throw new IntegrityViolationError();
        }
        return new UserStoryCommandPermissionAddedV1Event(this.id, command.id, command.endpoint, command.filter);
    }

    @EventHandler(UserStoryCommandPermissionAddedV1Event)
    handleCommandPermissionAdded(event: UserStoryCommandPermissionAddedV1Event) {
        this.commandPermissionIds.push(event.permissionId);
    }


    @CommandHandler(RemoveCommandPermissionFromUserStoryCommand)
    removeCommandPermission(command: RemoveCommandPermissionFromUserStoryCommand) {
        if (!this.commandPermissionIds.includes(command.permissionId)) {
            return null;
        }
        return new UserStoryCommandPermissionRemovedV1Event(this.id, command.permissionId);
    }

    @EventHandler(UserStoryCommandPermissionRemovedV1Event)
    handleCommandPermissionRemoved(event: UserStoryCommandPermissionRemovedV1Event) {
        this.commandPermissionIds = this.commandPermissionIds.filter(id => id !== event.permissionId);
    }
}
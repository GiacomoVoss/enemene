import {ReadModel} from "../class/read-model.class";
import {EventHandler} from "../decorator/event-handler.decorator";
import {RoleCreatedV1Event, RoleDeletedV1Event, UserStoryAssignedToRoleV1Event, UserStoryDeletedV1Event, UserStoryUnassignedFromRoleV1Event} from "../event";
import {EventMetadata} from "../interface/event-metadata.interface";
import {ReadModelRepositoryService} from "../service/read-model-repository.service";
import {EnemeneCqrs} from "../../application";
import {UserStory} from "./user-story.read-model";
import {ReadPermission} from "../interface/read-permission.interface";
import {ReadEndpoint} from "../decorator/read-endpoint.decorator";

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

    @EventHandler(RoleCreatedV1Event)
    handleCreated(event: RoleCreatedV1Event) {
        this.name = event.name;
    }

    @EventHandler(RoleDeletedV1Event)
    handleDeleted() {
        this.deleted = true;
    }

    @EventHandler(UserStoryAssignedToRoleV1Event)
    handleUserStoryAssigned(event: UserStoryAssignedToRoleV1Event) {
        const userStory: UserStory = EnemeneCqrs.app.inject(ReadModelRepositoryService).getOrCreateObject(UserStory, event.userStoryId);
        if (userStory) {
            this.userStories.push(userStory);
        }
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
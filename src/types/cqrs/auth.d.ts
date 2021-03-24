import {Dictionary, uuid} from "../base";
import {AbstractCommand, ReadModel} from "../../modules/core/cqrs";

type ReadModelFieldPermissionsMap = Dictionary<boolean>;

export type ReadModelFieldPermissions = Dictionary<boolean | ReadModelFieldPermissionsMap>;

export declare class AbstractUserReadModel extends ReadModel {

    $includeInToken: string[];

    username: string;

    password: string;

    roleId: uuid;

    active: boolean;

    static encodePassword(password: string): string;

    static comparePassword(clearTextPassword: string, encryptedPassword: string): boolean;
}

export declare class CreateRoleCommand extends AbstractCommand {

    $endpoint: "role.create";

    public name: string;

    constructor(name: string);
}

export declare class DeleteRoleCommand extends AbstractCommand {

    $endpoint: "role.delete";
}

export declare class CreateUserStoryCommand extends AbstractCommand {

    $endpoint: "userStory.create";

    public name: string;

    constructor(name: string);
}

export declare class DeleteUserStoryCommand extends AbstractCommand {

    $endpoint: "userStory.delete";
}

export declare class AssignUserStoryToRoleCommand extends AbstractCommand {

    $endpoint: "role.userStory.unassign";

    public userStoryId: uuid;

    constructor(userStoryId: uuid);
}


export declare class UnassignUserStoryFromRoleCommand extends AbstractCommand {

    $endpoint: "role.userStory.unassign";

    public userStoryId: uuid;

    constructor(userStoryId: uuid);
}

export declare class AddReadPermissionToUserStoryCommand extends AbstractCommand {

    $endpoint: "userStory.readPermission.create";

    public id: uuid;
    public readModel: string;
    public fields?: ReadModelFieldPermissions;
    public filter?: string;

    constructor(id: uuid,
                readModel: string,
                fields?: ReadModelFieldPermissions,
                filter?: string);
}

export declare class RemoveReadPermissionFromUserStoryCommand extends AbstractCommand {

    $endpoint: "readPermission.delete";

    public permissionId: uuid;

    constructor(permissionId: uuid);

}
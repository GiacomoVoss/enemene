import {RequestContext} from "./controller";
import {AbstractUser} from "./auth";
import {Dictionary, serializable} from "./base";


/**
 * Implement this interface on a {@link DataObject} class to trigger stuff before a new object of the class is created.
 */
export declare interface BeforeCreateHook {
    onBeforeCreate(context: RequestContext<AbstractUser>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff after a new object of the class was created.
 */
export declare interface AfterCreateHook {
    onAfterCreate(context: RequestContext<AbstractUser>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff before an object of the class is deleted.
 */
export declare interface BeforeDeleteHook {
    onBeforeDelete(context: RequestContext<AbstractUser>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff before an object of the class is updated.
 */
export interface BeforeUpdateHook {
    onBeforeUpdate(context: RequestContext<AbstractUser>, oldValues: Dictionary<serializable>): Promise<void>;
}

/**
 * Implement this interface on a {@link DataObject} class to trigger stuff after an object of the class was updated.
 */
export interface AfterUpdateHook {
    onAfterUpdate(context: RequestContext<AbstractUser>, oldValues: Dictionary<serializable>): Promise<void>;
}

import {DataObject, VirtualObject} from "./model";
import {ConstructorOf, uuid} from "./base";
import {RequestContext} from "./controller";
import {AbstractUser} from "./auth";
import {AbstractAction} from "./action";
import {Order} from "sequelize";
import {AbstractFilter} from "./filter";
import {AbstractValidate} from "../modules/core/validation/class/abstract-validate.class";
import {Dictionary} from "../base/type/dictionary.type";
import {serializable} from "../base/type/serializable.type";

export {Order} from "sequelize";

/**
 * Abstract class to extend when defining a view.
 */
export declare abstract class View<ENTITY extends DataObject<ENTITY>> {
    public id: uuid;

    public setValues(data: Dictionary<serializable>, context?: RequestContext<AbstractUser>): void;

    toJSON(): object;
}

/**
 * Annotate every {@link View} class with this annotation to define the view's configuration.
 * @param id {uuid} A random ID to identify the view.
 * @param entity {() => ConstructorOf<ENTITY>} The entity on which the view is based.
 * @param configuration {ViewDefinitionConfiguration<ENTITY>} The additional configurations for this view (see below).
 */
export declare function ViewDefinition<ENTITY extends DataObject<ENTITY>>(id: uuid, entity: () => ConstructorOf<ENTITY>, configuration?: ViewDefinitionConfiguration<ENTITY>): Function;

/**
 * Additional configurations for a {@link View}.
 */
export interface ViewDefinitionConfiguration<ENTITY extends DataObject<ENTITY>> {
    /**
     * A function returning an {@link AbstractFilter} to apply to the view whenever it is used.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     */
    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    /**
     * Validation that should be applied to this view whenever an object is created or updated with it.
     */
    validation?: AbstractValidate;

    /**
     * Actions that should be available on this view.
     */
    actions?: ConstructorOf<AbstractAction>[];

    /**
     * The default order if a list of objects are requested.
     */
    defaultOrder?: Order;

    /**
     * Attributes that should be indexed and searched if a GET request with a "search" query parameter is used.
     */
    searchAttributes?: string[];

    /**
     * Any additional meta information that will not be interpreted by the framework.
     */
    meta?: any;
}

/**
 * Annotate a class attribute in a {@link View} class to define a view field.
 * @param configuration {ViewFieldConfiguration<SUBENTITY, SUBVIEW>} The configuration for this view field.
 */
export declare function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>
(configuration: ViewFieldConfiguration<SUBENTITY, SUBVIEW>): Function

/**
 * Annotate a class attribute in a {@link View} class to define a simple view field.
 * @param position {number} The ordering position of the field. Should be interpreted by the client.
 */
export declare function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>
(position: number): Function

/**
 * The configuration for a {@link ViewField}.
 */
export interface ViewFieldConfiguration<SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>> {
    /**
     * The ordering position of the field. Should be interpreted by the client.
     */
    position: number;

    /**
     * The help description of the field.
     */
    description?: string | string[];

    /**
     * Defines if the field is a calculated field. Only use this with a getter function.
     */
    calculated?: boolean;

    /**
     * A flag determining if the value of this view field can be updated. Overwrites the permissions specified in {@link ViewPermission#permissions}.
     */
    canUpdate?: boolean;

    /**
     * A flag determining if the value of this view field can be set when creating an object. Overwrites the permissions specified in {@link ViewPermission#permissions}.
     */
    canCreate?: boolean;

    /**
     * A flag determining if objects can be inserted in the collection value of this view field. Overwrites the permissions specified in {@link ViewPermission#permissions}.
     */
    canInsert?: boolean;

    /**
     * A flag determining if objects can be removed from the collection value of this view field. Overwrites the permissions specified in {@link ViewPermission#permissions}.
     */
    canRemove?: boolean;

    /**
     * A function to generate a default value.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     */
    default?(context?: RequestContext<AbstractUser>): any,

    /**
     * A flag determining if the field is required when updating/creating an object.
     */
    required?: boolean;

    /**
     * A subordinate view to define the fields of the underlying object value of the field.
     */
    subView?: ConstructorOf<SUBVIEW>;

    /**
     * Any additional meta information that will not be interpreted by the framework.
     */
    meta?: any;
}

export class ViewFieldDefinition<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>> {
    public name: keyof View<ENTITY>;
    public description?: string | string[];
    public position: number;
    public calculated?: boolean;
    public required: boolean;
    public fieldType?: any;
    public subView?: ConstructorOf<View<SUBENTITY>>;
    public isArray: boolean;
    public default: (context?: RequestContext<AbstractUser>) => any;
    private meta?: any;

    constructor(name: keyof View<ENTITY>, fieldType: any, configuration: ViewFieldConfiguration<SUBENTITY, View<SUBENTITY>>);

    public toJSON();
}

/**
 * Inject and use this service to interact with views in code.
 */
export declare class ViewService {

    /**
     * Returns all objects found by this view.
     * @param viewClass {ConstructorOf<VIEW>} The {@link View} class to request.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     * @param filter [{AbstractFilter}] An additional filter to concatenate with the {@link View}'s own filter.
     * @param options [{ViewFindOptions}] Additional options to configure the request.
     */
    public findAll<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                 context: RequestContext<AbstractUser>,
                                                                                 filter?: AbstractFilter,
                                                                                 options?: ViewFindOptions): Promise<VIEW[]>;

    /**
     * Returns exactly one object that matches the search criteria.
     * @param viewClass {ConstructorOf<VIEW>} The {@link View} class to request.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     * @param filter [{AbstractFilter}] An additional filter to concatenate with the {@link View}'s own filter.
     */
    public findOne<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                 context: RequestContext<AbstractUser>,
                                                                                 filter?: AbstractFilter): Promise<VIEW>;

    /**
     * Returns the object with the given ID.
     *
     * @param viewClass {ConstructorOf<VIEW>} The {@link View} class to request.
     * @param objectId {uuid} The ID of the object to find.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     */
    public findById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                  objectId: uuid,
                                                                                  context: RequestContext<AbstractUser>): Promise<VIEW | undefined>;

    /**
     * Returns the object with the given ID or throws an {@link ObjectNotFoundError} if the object could not be found.
     *
     * @param viewClass {ConstructorOf<VIEW>} The {@link View} class to request.
     * @param objectId {uuid} The ID of the object to find.
     * @param context {RequestContext<AbstractUser>} The context of the current request.
     */
    public findNotNullById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                         objectId: uuid,
                                                                                         context: RequestContext<AbstractUser>): Promise<VIEW>;

    /**
     * Saves the given view object.
     * @param view {View<ENTITY>} The object to save.
     * @param context {RequestContext<AbstractUser>} The context of the current request
     */
    public save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                   context: RequestContext<AbstractUser>): Promise<View<ENTITY>>;

    /**
     * Deletes the given view object.
     * @param view {View<ENTITY>} The object to delete.
     * @param context {RequestContext<AbstractUser>} The context of the current request
     */
    public delete<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                     context: RequestContext<AbstractUser>): Promise<void>;
}

export interface ViewFindOptions {
    order?: string[][];
    limit?: number;
    offset?: number;
    searchString?: string;
}

export declare class ViewObject extends VirtualObject<ViewObject> {
    id: uuid;

    name: string;

    protected getObjects(): ViewObject[];
}
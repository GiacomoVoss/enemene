import {DataObject} from "./model";
import {ConstructorOf, Dictionary, serializable, uuid} from "./base";
import {RequestContext} from "./controller";
import {AbstractUser} from "./auth";
import {AbstractAction} from "./action";
import {Order} from "sequelize";
import {AbstractFilter} from "./filter";
import {AbstractValidate} from "../modules/core/validation/class/abstract-validate.class";

export {Order} from "sequelize";

export declare abstract class View<ENTITY extends DataObject<ENTITY>> {
    public id: uuid;

    public $displayPattern: string;

    setValues(data: Dictionary<serializable>, context: RequestContext<AbstractUser>): void;

    toJSON(): object;
}

export interface ViewFieldConfiguration<SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>> {
    position: number;
    canUpdate?: boolean;
    canCreate?: boolean;
    canInsert?: boolean;
    canRemove?: boolean;
    default?: (context: RequestContext<AbstractUser>) => any,
    required?: boolean;
    subView?: ConstructorOf<SUBVIEW>;
    meta?: any;
}

export function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>
(configuration: ViewFieldConfiguration<SUBENTITY, SUBVIEW>): Function

export function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>
(position: number): Function

export interface ViewFindOptions {
    order?: string;
    limit?: number;
    offset?: number;
    searchString?: string;
}

export declare class ViewService {

    public startTransaction(): Promise<uuid>;

    public commitTransaction(id: uuid): Promise<void>;
    
    public findAll<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                 context: RequestContext<AbstractUser>,
                                                                                 filter?: AbstractFilter,
                                                                                 options?: ViewFindOptions): Promise<VIEW[]>;

    public findOne<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                 context: RequestContext<AbstractUser>,
                                                                                 filter?: AbstractFilter): Promise<VIEW>;

    public findById<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                  objectId: uuid,
                                                                                  context: RequestContext<AbstractUser>): Promise<VIEW | undefined>;

    public save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                   context: RequestContext<AbstractUser>,
                                                   transactionId?: uuid): Promise<View<ENTITY>>;

    public delete<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                     context: RequestContext<AbstractUser>): Promise<void>;
}


export function ViewDefinition<ENTITY extends DataObject<ENTITY>>(id: uuid, entity: () => ConstructorOf<ENTITY>, configuration?: ViewDefinitionConfiguration<any>): Function;

export interface ViewDefinitionConfiguration<ENTITY extends DataObject<ENTITY>> {
    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    validation?: AbstractValidate;

    actions?: ConstructorOf<AbstractAction>[];

    defaultOrder?: Order;

    creatable?: boolean;
    updatable?: boolean;
    deletable?: boolean;

    searchAttributes?: string[];

    meta?: any;
}

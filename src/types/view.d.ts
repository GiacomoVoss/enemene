import {DataObject} from "./model";
import {ConstructorOf, Dictionary, serializable, uuid} from "./base";
import {RequestContext} from "./controller";
import {AbstractUser} from "./auth";
import {AbstractAction} from "./action";
import {Order} from "sequelize";
import {AbstractFilter} from "./filter";

export {Order} from "sequelize";

export declare abstract class View<ENTITY extends DataObject<ENTITY>> {
    public id: uuid;

    public $displayPattern: string;

    setValues(data: Dictionary<serializable>): void;

    toJSON(): object;
}


export declare function ViewField<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>, SUBVIEW extends View<SUBENTITY>>(position: number, subView?: ConstructorOf<SUBVIEW>, count?: boolean): Function;

export declare class ViewService {

    public findAllByView<ENTITY extends DataObject<ENTITY>, VIEW extends View<ENTITY>>(viewClass: ConstructorOf<VIEW>,
                                                                                       filter?: AbstractFilter): Promise<VIEW[]>;

    public save<ENTITY extends DataObject<ENTITY>>(view: View<ENTITY>,
                                                   viewClass: ConstructorOf<View<ENTITY>>,
                                                   context?: RequestContext<AbstractUser>): Promise<View<ENTITY>>;
}

export function ViewDefinition<ENTITY extends DataObject<ENTITY>>(entity: ConstructorOf<ENTITY>, configuration?: ViewDefinitionConfiguration<any>): Function;

export interface ViewDefinitionConfiguration<ENTITY extends DataObject<ENTITY>> {
    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    actions?: ConstructorOf<AbstractAction>[];

    defaultOrder?: Order;

    searchAttributes?: string[];
}

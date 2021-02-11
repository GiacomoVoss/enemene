import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractFilter} from "../../filter";
import {AbstractAction} from "../../action";
import {Order} from "sequelize";
import {RequestContext} from "../../router/interface/request-context.interface";
import {AbstractUser} from "../../auth";

export class ViewDefinitionConfiguration<ENTITY extends DataObject<ENTITY>> {
    filter?(context: RequestContext<AbstractUser>): AbstractFilter;

    actions?: ConstructorOf<AbstractAction>[];

    defaultOrder?: Order;

    searchAttributes?: string[];

    meta?: any;
}

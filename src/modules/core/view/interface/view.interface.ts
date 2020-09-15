import {SchemaMap} from "@hapi/joi";
import {Order} from "sequelize";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {Filter} from "../../filter";
import {AbstractAction} from "../../action";
import {ViewField} from "./view-field.interface";

export interface View<ENTITY extends DataObject<ENTITY>> {

    /**
     * Entity the view is based on.
     */
    entity: () => ConstructorOf<ENTITY>;

    /**
     * Fields to include.
     */
    fields: ViewField<ENTITY>[];

    /**
     * Validation schema for updating/creating objects through the view.
     */
    validationSchema?: SchemaMap;

    /**
     * Optional filter to scope the accessible objects.
     */
    filter?: Filter;

    /**
     * Default order.
     */
    defaultOrder?: Order;

    searchAttributes?: string[];

    actions?: (typeof AbstractAction)[];
}

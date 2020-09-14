import {SchemaMap} from "@hapi/joi";
import {Order} from "sequelize";
import {ViewFieldDefinition} from "./view-field-definition.interface";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../base/constructor-of";
import {Filter} from "../../filter";
import {AbstractAction} from "../../action";

export interface View<ENTITY extends DataObject<ENTITY>> {

    /**
     * Entity the view is based on.
     */
    entity: () => ConstructorOf<ENTITY>;

    /**
     * Fields to include.
     */
    fields: (ViewFieldDefinition<ENTITY, any> | keyof ENTITY | string)[];

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

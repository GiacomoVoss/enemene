import { SchemaMap } from "@hapi/joi";
import { Order } from "sequelize";
import { ViewFieldDefinition } from "./view-field-definition.interface";
import { DataObject } from "../../model/data-object.model";
import { ConstructorOf } from "../../../../base/constructor-of";
import { Filter } from "../../filter/type/filter.type";
export interface View<ENTITY extends DataObject<ENTITY>> {
    /**
     * Name of the view.
     */
    name: string;
    /**
     * Entity the view is based on.
     */
    entity: () => ConstructorOf<ENTITY>;
    /**
     * Fields to include.
     */
    fields: (ViewFieldDefinition<ENTITY, any> | keyof ENTITY)[];
    /**
     * Validation schema for updating/creating objects through the view.
     */
    validationSchema?: SchemaMap;
    /**
     * Optional filter to scope the accessible objects.
     */
    filter?: Filter<ENTITY>;
    /**
     * Default order.
     */
    defaultOrder?: Order;
}

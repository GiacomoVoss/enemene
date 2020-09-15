import {DataObject} from "../../model";
import {ViewFieldDefinition} from "./view-field-definition.interface";

export type ViewField<ENTITY extends DataObject<ENTITY>> = ViewFieldDefinition<ENTITY, any> | keyof ENTITY | string;

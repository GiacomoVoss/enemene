import {View} from "./view.interface";
import {DataObject} from "../../model";

export interface ViewFieldDefinition<ENTITY extends DataObject<ENTITY>, SUBENTITY extends DataObject<SUBENTITY>> {
    field: keyof ENTITY;
    view: View<SUBENTITY>;
    allowedValuesView?: View<SUBENTITY>
}

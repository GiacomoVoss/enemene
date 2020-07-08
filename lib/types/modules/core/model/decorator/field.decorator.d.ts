import { ModelAttributeColumnOptions } from "sequelize";
import { EntityFieldType } from "../enum/entity-field-type.enum";
export declare function Field(label: string, type?: EntityFieldType, required?: boolean, options?: Partial<ModelAttributeColumnOptions>): Function;

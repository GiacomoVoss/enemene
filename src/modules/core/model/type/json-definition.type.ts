import {JsonRule} from "../interface/json-rule.interface";

/**
 * Type for a json transmutation definition.
 */
export type JsonDefinition = (string | JsonRule)[];

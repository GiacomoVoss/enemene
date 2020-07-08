/**
 * @packageDocumentation @module Base
 *
 * A type for defining a map from string (or types inferred to string) to any object.
 */
export type Dictionary<ENTITY, KEY extends string | number | symbol = string> = Partial<Record<KEY, ENTITY>>;

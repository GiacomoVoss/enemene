/**
 * A rule for transmuting a field into json.
 */
export interface JsonRule {
    /**
     * The field name.
     */
    key: string;

    /**
     * An optional key for the resulting json value.
     */
    jsonKey?: string;

    /**
     * A transmutation function.
     * @param any
     */
    fn: (any) => any;
}

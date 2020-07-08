/**
 * Service for handling UUIDs.
 */
export declare class UuidService {
    /**
     * Regular expression for a UUID.
     */
    private static uuidRegExp;
    /**
     * Generates a new UUID.
     */
    static getUuid(): string;
    /**
     * Checks if a given string is a valid UUID.
     * @param text
     */
    static isUuid(text: string): boolean;
}

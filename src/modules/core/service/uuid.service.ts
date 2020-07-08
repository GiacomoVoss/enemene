import {v4} from "uuid";

/**
 * Service for handling UUIDs.
 */
export class UuidService {

    /**
     * Regular expression for a UUID.
     */
    private static uuidRegExp: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    /**
     * Generates a new UUID.
     */
    public static getUuid(): string {
        return v4();
    }

    /**
     * Checks if a given string is a valid UUID.
     * @param text
     */
    public static isUuid(text: string): boolean {
        return !!text.match(this.uuidRegExp);
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UuidService = void 0;
const uuid_1 = require("uuid");
/**
 * Service for handling UUIDs.
 */
class UuidService {
    /**
     * Generates a new UUID.
     */
    static getUuid() {
        return uuid_1.v4();
    }
    /**
     * Checks if a given string is a valid UUID.
     * @param text
     */
    static isUuid(text) {
        return !!text.match(this.uuidRegExp);
    }
}
exports.UuidService = UuidService;
/**
 * Regular expression for a UUID.
 */
UuidService.uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
//# sourceMappingURL=uuid.service.js.map
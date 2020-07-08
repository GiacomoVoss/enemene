"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabel = exports.Label = void 0;
require("reflect-metadata");
const labelMetadataKey = Symbol("label");
function Label(label) {
    return Reflect.metadata(labelMetadataKey, label);
}
exports.Label = Label;
function getLabel(target, propertyKey) {
    return Reflect.getMetadata(labelMetadataKey, target, propertyKey);
}
exports.getLabel = getLabel;
//# sourceMappingURL=label.decorator.js.map
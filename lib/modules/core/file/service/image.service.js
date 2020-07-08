"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const file_service_1 = require("./file.service");
/**
 * Service handling image manipulations.
 */
class ImageService {
    /**
     * Get the given image in the given dimensions. If the image doesn't exist yet it will be created.
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static getResizedImage(imagePath, maxWidth, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            const resizedFileName = ImageService.getResizedFileName(imagePath, maxWidth, maxHeight);
            if (file_service_1.FileService.fileExists(resizedFileName)) {
                return resizedFileName;
            }
            else {
                return yield ImageService.resizeAndSave(imagePath, maxWidth, maxHeight);
            }
        });
    }
    /**
     * Creates a new image with the given dimensions and saves it to the file system.
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static resizeAndSave(imagePath, maxWidth, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            const resizedFileName = ImageService.getResizedFileName(imagePath, maxWidth, maxHeight);
            yield sharp_1.default(imagePath)
                .resize(maxWidth, maxHeight, { fit: "inside" })
                .toFile(resizedFileName);
            return resizedFileName;
        });
    }
    /**
     * Returns a name for the resized image in the pattern "FileName_123w_123h.jpg",
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static getResizedFileName(imagePath, maxWidth, maxHeight) {
        const [imageName, extension] = file_service_1.FileService.splitFileName(imagePath);
        let newImageName = imageName;
        if (maxWidth) {
            newImageName += `_${maxWidth}w`;
        }
        if (maxHeight) {
            newImageName += `_${maxHeight}h`;
        }
        newImageName += `.${extension}`;
        return newImageName;
    }
}
exports.ImageService = ImageService;
//# sourceMappingURL=image.service.js.map
import sharp from "sharp";
import {FileService} from "./file.service";

/**
 * Service handling image manipulations.
 */
export class ImageService {

    /**
     * Get the given image in the given dimensions. If the image doesn't exist yet it will be created.
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    public static async getResizedImage(imagePath: string, maxWidth?: number, maxHeight?: number): Promise<string> {
        const resizedFileName = ImageService.getResizedFileName(imagePath, maxWidth, maxHeight);

        if (FileService.fileExists(resizedFileName)) {
            return resizedFileName;
        } else {
            return await ImageService.resizeAndSave(imagePath, maxWidth, maxHeight);
        }
    }


    /**
     * Creates a new image with the given dimensions and saves it to the file system.
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    public static async resizeAndSave(imagePath: string, maxWidth?: number, maxHeight?: number): Promise<string> {
        const resizedFileName = ImageService.getResizedFileName(imagePath, maxWidth, maxHeight);

        await sharp(imagePath)
            .resize(maxWidth, maxHeight, {fit: "inside"})
            .toFile(resizedFileName);

        return resizedFileName;
    }

    /**
     * Returns a name for the resized image in the pattern "FileName_123w_123h.jpg",
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    public static getResizedFileName(imagePath: string, maxWidth?: number, maxHeight?: number): string {
        const [imageName, extension] = FileService.splitFileName(imagePath);
        let newImageName: string = imageName;
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

/**
 * Service handling image manipulations.
 */
export declare class ImageService {
    /**
     * Get the given image in the given dimensions. If the image doesn't exist yet it will be created.
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static getResizedImage(imagePath: string, maxWidth?: number, maxHeight?: number): Promise<string>;
    /**
     * Creates a new image with the given dimensions and saves it to the file system.
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static resizeAndSave(imagePath: string, maxWidth?: number, maxHeight?: number): Promise<string>;
    /**
     * Returns a name for the resized image in the pattern "FileName_123w_123h.jpg",
     *
     * @param imagePath – Path to the image.
     * @param maxWidth - Required maximum width.
     * @param maxHeight – Required maximum height.
     */
    static getResizedFileName(imagePath: string, maxWidth?: number, maxHeight?: number): string;
}

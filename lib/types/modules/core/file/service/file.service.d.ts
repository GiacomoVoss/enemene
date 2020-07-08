export declare class FileService {
    /**
     * Copies a file from one destination path to the other.
     * @param from      Source path.
     * @param to        Destination path.
     * @param exact     The given paths are exact and don't need to be prefixed.
     */
    static copyFile(from: string, to: string, exact?: boolean): Promise<unknown>;
    /**
     * Delets a file at the given path.
     * @param filePath
     */
    static deleteFile(filePath: any): void;
    /**
     * Checks if a given file exists.
     * @param filePath
     * @return boolean if the file exists.
     */
    static fileExists(filePath: string): boolean;
    /**
     * Recursively creates a folder and all the folders along the way, if it doesn't exist.
     *
     * @param dir   Path to the folder.
     */
    static mkdirIfMissing(dir: string): void;
    /**
     * Splits a full file name in file name and extension.
     *
     * @param fileName  The filename to split.
     */
    static splitFileName(fileName: string): [string, string];
    /**
     * Returns paths to all files with the given file name pattern.
     *
     * @param dir       Directory to search in.
     * @param pattern   File pattern to look for.
     */
    static scanForFilePattern(dir: string, pattern: RegExp): string[];
}

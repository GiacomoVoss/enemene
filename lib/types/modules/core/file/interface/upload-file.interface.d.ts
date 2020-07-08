/**
 * Interface for {@link DataObject}s that function as a file.
 * Needed for generic file management in file.module.ts.
 */
export interface UploadFile {
    /**
     * Humanly readable file name.
     */
    filename: string;
    /**
     * Size of the file.
     */
    size: number;
    /**
     * Internal file path and name.
     */
    file: string;
}

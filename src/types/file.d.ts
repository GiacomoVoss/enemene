import {DataObject} from "./model";
import {uuid} from "./base";

export declare class File extends DataObject<File> {

    name: string;

    originalName: string;

    size: number;

    uploadedBy: uuid;
}

export declare class DataFileService {
    public downloadAndSave(url: string, filename: string);

    public fileExists(filePath: string): boolean;

    public get(filename: string): Buffer;

    public getMimeType(fileName: string): Promise<string>;
}
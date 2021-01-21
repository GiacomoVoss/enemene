import {DataObject} from "./model";
import {uuid} from "./base";

export declare class File extends DataObject<File> {

    name: string;

    originalName: string;

    size: number;

    uploadedBy: uuid;
}
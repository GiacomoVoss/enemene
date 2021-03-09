import {Dictionary, serializable, uuid} from "./base";

export declare class DocumentService {

    public generateDocumentFromFile(templateFilePath: string, context?: Dictionary<serializable>, options?: GenerateDocumentOptions): Promise<uuid>;
}

export interface GenerateDocumentOptions {

    /**
     * The name of the resulting file.
     */
    fileName?: string,

    /**
     * Content for the headline. Can contain html.
     */
    headline?: string;

    /**
     * Determines if page numbers should be shown in the bottom right corner.
     */
    showPageNumbers?: boolean;
}
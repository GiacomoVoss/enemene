import {DataObject} from "./model";
import {AbstractFilter} from "./filter";
import {ConstructorOf, uuid} from "./base";

export declare abstract class AbstractImportDefinition<TARGET extends DataObject<TARGET>> {

    protected abstract requiredFields: string[];

    public abstract getFilter?(): AbstractFilter;

    public abstract getEntity(): ConstructorOf<TARGET>;
}

export enum DataImportStatus {
    NEW = "NEW",
    ANALYSED = "ANALYSED",
    READY = "READY",
    FINISHED = "FINISHED"
}

export class DataImport extends DataObject<DataImport> {

    name: string;

    status: DataImportStatus;

    importDefinition: string;

    fieldMappings: ImportFieldMapping[];

    referenceMappings: ImportReferenceMapping[];

    entity(): string;
}

export class ImportReferenceMapping extends DataObject<ImportReferenceMapping> {

    importId: uuid;

    field: string;

    sourceValue: string;

    targetValue: uuid;
}


export class ImportFieldMapping extends DataObject<ImportFieldMapping> {

    importId: uuid;

    column: string;

    field: string;
}

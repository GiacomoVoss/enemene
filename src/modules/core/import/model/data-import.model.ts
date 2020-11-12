import {AllowedValues, Calculated, Collection, DataObject, Entity, EntityFieldType, Field} from "../../model";
import {ImportFieldMapping} from "./import-field-mapping.model";
import {ImportReferenceMapping} from "./import-reference-mapping.model";
import {AbstractUser, Enemene} from "../../../..";
import {DataImportService} from "../service/data-import.service";
import {DataImportStatus} from "../enum/data-import-status.enum";
import {RequestContext} from "../../router/interface/request-context.interface";

@Entity
export class DataImport extends DataObject<DataImport> {

    @Field("Name", EntityFieldType.STRING, true)
    name: string;

    @Field("Status", EntityFieldType.ENUM(DataImportStatus), true, {
        defaultValue: DataImportStatus.NEW,
    })
    status: DataImportStatus;

    @Field("Import definition", EntityFieldType.STRING, true)
    importDefinition: string;

    @AllowedValues<DataImport>("importDefinition")
    async importDefinitionAllowedValues(context: RequestContext<AbstractUser>): Promise<string[]> {
        return Enemene.app.inject(DataImportService).getImportDefinitionsList();
    }

    @Collection("Field mappings", () => ImportFieldMapping, "importId", true)
    fieldMappings: ImportFieldMapping[];

    @Collection("Reference mappings", () => ImportReferenceMapping, "importId", true)
    referenceMappings: ImportReferenceMapping[];

    @Calculated("Entity", EntityFieldType.STRING, ["importDefinition"])
    entity(): string {
        return Enemene.app.inject(DataImportService).getImportDefinition(this.importDefinition).getEntity().name;
    }
}

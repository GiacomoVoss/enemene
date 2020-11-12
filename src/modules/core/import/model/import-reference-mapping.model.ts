import {DataObject, Entity, EntityFieldType, Field} from "../../model";
import {uuid} from "../../../../base/type/uuid.type";

@Entity
export class ImportReferenceMapping extends DataObject<ImportReferenceMapping> {

    importId: uuid;

    @Field("Field name", EntityFieldType.STRING, true)
    field: string;

    @Field("Field value", EntityFieldType.STRING, true)
    sourceValue: string;

    @Field("Target value", EntityFieldType.STRING, true)
    targetValue: uuid;
}

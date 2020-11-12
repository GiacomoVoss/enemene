import {DataObject, Entity, EntityFieldType, Field} from "../../model";
import {uuid} from "../../../../base/type/uuid.type";

@Entity
export class ImportFieldMapping extends DataObject<ImportFieldMapping> {

    importId: uuid;

    @Field("Column name", EntityFieldType.STRING, true)
    column: string;

    @Field("Field name", EntityFieldType.STRING, true)
    field: string;
}

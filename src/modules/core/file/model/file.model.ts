import {DataObject, Entity, EntityFieldType, Field} from "../../model";
import {uuid} from "../../../../base/type/uuid.type";

@Entity
export class File extends DataObject<File> {

    $displayPattern = "{originalName}";

    @Field("Original name", EntityFieldType.STRING, true)
    originalName: string;

    @Field("File size", EntityFieldType.INTEGER, true)
    size: number;

    @Field("Uploader id", EntityFieldType.STRING)
    uploadedById: uuid;

    @Field("Temporary", EntityFieldType.BOOLEAN, true, {
        defaultValue: true,
    })
    temporary: boolean;

}
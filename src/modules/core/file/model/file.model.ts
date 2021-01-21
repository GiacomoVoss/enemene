import {DataObject, Entity, EntityFieldType, Field} from "../../model";

@Entity
export class File extends DataObject<File> {

    @Field("Name", EntityFieldType.STRING, true)
    name: string;

    @Field("Original name", EntityFieldType.STRING, true)
    originalName: string;

    @Field("File size", EntityFieldType.INTEGER, true)
    size: number;
    //
    // @Reference("Uploader", () => Enemene.app.config.userModel)
    // uploadedBy: uuid;
}
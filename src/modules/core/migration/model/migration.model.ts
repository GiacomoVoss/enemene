import {DataObject, Entity, EntityFieldType, Field} from "../../model";

@Entity
export class Migration extends DataObject<Migration> {

    @Field("Execution time", EntityFieldType.DATE)
    executedAt: Date;

    @Field("Succeeded", EntityFieldType.BOOLEAN)
    success: boolean;

    @Field("File name")
    fileName: string;

    @Field("Version")
    version: string;
}
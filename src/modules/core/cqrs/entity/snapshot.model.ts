import {DataObject, Entity} from "../../model";

@Entity
export class Snapshot extends DataObject<Snapshot> {

    position: number;

    data: any;

}
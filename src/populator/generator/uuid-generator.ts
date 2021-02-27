import {AbstractGenerator} from "../interface/abstract-generator.interface";
import {uuid} from "../../base/type/uuid.type";
import {v5} from "uuid";

export class UuidGenerator implements AbstractGenerator<uuid> {
    private static NAMESPACE: string = "9faeb11d-0816-4e56-9f44-0eb6ac0cb705";

    public generate(seed: string): uuid {
        return v5(seed, UuidGenerator.NAMESPACE);
    }
}

import {Dictionary} from "../../../../base/type/dictionary.type";

export class CustomResponse<DATA> {
    constructor(public status: number,
                public data: DATA,
                public headers: Dictionary<string> = {}) {
    }
}

import {ActionStepResult} from "./action-step-result.class";
import {ActionResultStatus} from "../enum/action-result-status.enum";
import {uuid} from "../../../../base/type/uuid.type";

export class ActionStepResultFile extends ActionStepResult {

    constructor(public fileId: uuid) {
        super(ActionResultStatus.FILE);
    }
}

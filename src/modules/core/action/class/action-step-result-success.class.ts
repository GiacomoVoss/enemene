import {ActionStepResult} from "./action-step-result.class";
import {ActionResultStatus} from "../enum/action-result-status.enum";

export class ActionStepResultSuccess extends ActionStepResult {

    constructor() {
        super(ActionResultStatus.SUCCESS);
    }
}

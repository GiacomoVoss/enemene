import {ActionResultStatus} from "../enum/action-result-status.enum";

export abstract class ActionStepResult {

    protected constructor(public status: ActionResultStatus) {
    }
}

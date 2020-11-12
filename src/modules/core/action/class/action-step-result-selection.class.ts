import {ActionStepResult} from "./action-step-result.class";
import {ActionResultStatus} from "../enum/action-result-status.enum";
import {View} from "../../view";
import {ConstructorOf} from "../../../../base/constructor-of";

export class ActionStepResultSelection<VIEW extends View<any>> extends ActionStepResult {

    constructor(public view: ConstructorOf<VIEW>,
                public preselection: VIEW[] = [],
                public singleSelection: boolean = false,
                public required: boolean = true) {
        super(ActionResultStatus.SELECTION);
    }
}

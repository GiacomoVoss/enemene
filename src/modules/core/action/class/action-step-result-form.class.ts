import {ActionStepResult} from "./action-step-result.class";
import {ActionResultStatus} from "../enum/action-result-status.enum";
import {View} from "../../view";
import {ConstructorOf} from "../../../../base/constructor-of";

export class ActionStepResultForm<VIEW extends View<any>> extends ActionStepResult {

    constructor(public view: ConstructorOf<VIEW>,
                public object?: VIEW) {
        super(ActionResultStatus.FORM);
    }
}

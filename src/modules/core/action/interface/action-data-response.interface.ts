import {DataResponse} from "../../data";
import {ActionResultStatus} from "../enum/action-result-status.enum";

export interface ActionDataResponse<ENTITY> {
    data?: DataResponse<ENTITY>;

    label?: string;

    type: ActionResultStatus;

    configuration?: {
        preselection?: object[];
        singleSelection?: boolean;
    }
}

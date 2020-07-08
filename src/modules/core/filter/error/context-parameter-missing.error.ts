import {RuntimeError} from "../../interface/runtime-error.interface";

export class ContextParameterMissingError extends Error implements RuntimeError {

    statusCode: number = 400;
    type: string = "ContextParameterMissingError";

    constructor(param: string) {
        super(`Kontextparameter "${param}" fehlt.`);
    }
}

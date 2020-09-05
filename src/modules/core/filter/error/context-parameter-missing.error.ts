import {RuntimeError} from "../../application/error/runtime.error";

export class ContextParameterMissingError extends RuntimeError {

    statusCode: number = 400;
    type: string = "ContextParameterMissingError";

    constructor(private param: string) {
        super(`Context parameter "${param}" missing in request`);
    }

    toJSON(): object {
        return {
            ...super.toJSON(),
            param: this.param,
        };
    }
}

import {RuntimeError} from "../../application/error/runtime.error";

export class OptimisticLockingError extends RuntimeError {

    statusCode: number = 400;

    constructor(public givenVersion: number,
                public actualVersion: number) {
        super(`Optimistic locking: ${givenVersion} does not match actual version ${actualVersion}.`);
    }
}
import {ValidationError} from "../modules/core/validation/interface/validation-error.interface";

export declare class RuntimeError extends Error {
    type: string;
    statusCode?: number;

    constructor(message: string);

    public toJSON(): object;
}


export declare class ObjectNotFoundError extends RuntimeError {

    private details?: string;

    constructor(details?: string);

    toJSON(): object;
}

export declare class UnsupportedOperationError extends RuntimeError {
    constructor(message: string);
}


export declare class IntegrityViolationError extends RuntimeError {
    constructor();
}

export class InputValidationError extends RuntimeError {

    protected details: ValidationError[];
    private entity: string;
    private language: string;

    constructor(details: ValidationError[],
                entity: string,
                language: string);
}


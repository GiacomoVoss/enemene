export declare class RuntimeError extends Error {
    type: string;
    statusCode?: number;

    constructor(message: string);

    public toJSON(): object;
}


export class ObjectNotFoundError extends RuntimeError {

    private details?: string;

    constructor(details?: string);

    toJSON(): object;
}


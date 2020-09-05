export class RuntimeError extends Error {
    type: string;

    statusCode?: number;

    constructor(message: string) {
        super(message);
    }

    public toJSON(): object {
        return {
            type: this.type,
            statusCode: this.statusCode ?? 500,
            message: this.message,
        };
    }
}

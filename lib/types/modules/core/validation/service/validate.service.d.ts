export declare class Validate {
    private functions;
    constructor(validationFunction: Function);
    static notNull(): Validate;
    static equals(value: any): Validate;
    notNull(): Validate;
    equals(value: any): Validate;
}

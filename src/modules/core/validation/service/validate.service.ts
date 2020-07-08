import {ValidationError} from "../error/validation.error";

export class Validate {

    private functions: Function[] = [];

    constructor(validationFunction: Function) {
        this.functions.push(validationFunction);
    }

    public static notNull(): Validate {
        return new Validate((v) => {
            if (v === null || v === undefined || (typeof v === "string" && v === "")) {
                throw new ValidationError("{field} darf nicht leer sein.");
            }
        });
    }

    public static equals(value: any): Validate {
        return new Validate((v) => {
            if (v != value) {
                throw new ValidationError("{field} muss gleich \"" + value + "\" sein.");
            }
        });
    }

    public notNull(): Validate {
        this.functions.push(Validate.notNull().functions[0]);
        return this;
    }

    public equals(value: any): Validate {
        this.functions.push(Validate.equals(value).functions[0]);
        return this;
    }
}

export class Validate {
    constructor(public name: string,
                public args: Validate[] = [],
                public parameters: any[] = []) {

    }

    public static and(...args: Validate[]): Validate {
        return new Validate(
            "and",
            args,
        );
    }

    public static or(...args: Validate[]): Validate {
        return new Validate(
            "or",
            args,
        );
    }

    public static not(arg: Validate): Validate {
        return new Validate(
            "not",
            [arg],
        );
    }

    public static equals(field: string, value: string | number): Validate {
        return new Validate(
            "equals",
            undefined,
            [field, value]
        );
    }

    public static exists(field: string): Validate {
        return new Validate(
            "exists",
            undefined,
            [field],
        );
    }
}

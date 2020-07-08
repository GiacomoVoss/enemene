export class Filter {
    constructor(public name: string,
                public args: Filter[] = [],
                public parameters: any[] = []) {

    }

    public static and(...args: Filter[]): Filter {
        return new Filter(
            "and",
            args,
        );
    }

    public static or(...args: Filter[]): Filter {
        return new Filter(
            "or",
            args,
        );
    }

    public static not(arg: Filter): Filter {
        return new Filter(
            "not",
            [arg],
        );
    }

    public static equals(field: string, value: string | number): Filter {
        return new Filter(
            "equals",
            undefined,
            [field, value]
        );
    }

    public static exists(entity: string, field: string, arg?: Filter): Filter {
        return new Filter(
            "exists",
            arg ? [arg] : [],
            [entity, field],
        );
    }
}

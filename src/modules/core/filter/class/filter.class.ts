import {serializable} from "../../../../base/type/serializable.type";

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

    public static equals(field: string, value: serializable): Filter {
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

    public static like(field: string, value: string): Filter {
        return new Filter(
            "like",
            undefined,
            [field, value]
        );
    }
}

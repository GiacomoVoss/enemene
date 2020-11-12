import {serializable} from "../../../../base/type/serializable.type";
import {FilterAnd} from "./filter-and.class";
import {FilterOr} from "./filter-or.class";
import {FilterNot} from "./filter-not.class";
import {FilterEquals} from "./filter-equals.class";
import {FilterExists} from "./filter-exists.class";
import {FilterLike} from "./filter-like.class";
import {FilterIn} from "./filter-in.class";
import {FilterTrue} from "./filter-true.class";
import {AbstractFilter} from "./abstract-filter.class";
import {FilterGreaterOrEqual} from "./filter-greater-or-equal.class";

export class Filter {

    public static and(...args: AbstractFilter[]): AbstractFilter {
        return new FilterAnd(args);
    }

    public static or(...args: AbstractFilter[]): AbstractFilter {
        return new FilterOr(args);
    }

    public static not(arg: AbstractFilter): AbstractFilter {
        return new FilterNot(arg);
    }

    public static equals(field: string, value: serializable): AbstractFilter {
        return new FilterEquals(field, value);
    }

    public static greaterOrEqual(field: string, value: number | Date): AbstractFilter {
        return new FilterGreaterOrEqual(field, value);
    }

    public static exists(field: string, arg?: AbstractFilter): AbstractFilter {
        return new FilterExists(field, arg);
    }

    public static like(field: string, value: string): AbstractFilter {
        return new FilterLike(field, value);
    }

    public static in(field: string, values: string[]): AbstractFilter {
        return new FilterIn(field, values);
    }

    public static true(): AbstractFilter {
        return new FilterTrue();
    }
}

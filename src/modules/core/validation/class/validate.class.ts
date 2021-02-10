import {ValidateAnd} from "./validate-and.class";
import {AbstractValidate} from "./abstract-validate.class";
import {ValidateOr} from "./validate-or.class";
import {ValidateNot} from "./validate-not.class";
import {ValidateExists} from "./validate-exists.class";
import {ValidateEquals} from "./validate-equals.class";

export class Validate {

    public static and(...args: AbstractValidate[]): AbstractValidate {
        return new ValidateAnd(args);
    }

    public static or(...args: AbstractValidate[]): AbstractValidate {
        return new ValidateOr(args);
    }

    public static not(arg: AbstractValidate): AbstractValidate {
        return new ValidateNot(arg);
    }

    public static equals(field: string, value: string | number): AbstractValidate {
        return new ValidateEquals(field, value);
    }

    public static exists(field: string): AbstractValidate {
        return new ValidateExists(field);
    }
}

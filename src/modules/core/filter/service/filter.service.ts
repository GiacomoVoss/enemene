import {FindOptions, IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {DataObject, Filter} from "../../../..";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractFilter} from "../class/abstract-filter.class";


export enum FilterTokenType {
    EXISTS = "EXISTS",
    AND = "AND",
    PARENTHESES = "PARENTHESES",
    OR = "OR",
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    NOT = "NOT",
}

export class FilterService {

    private static readonly IS_NUMBER: RegExp = /^[0-9]+([.,][0-9]+)?$/;

    private static readonly EXPRESSIONS: Record<FilterTokenType, RegExp> = {
        [FilterTokenType.AND]: /^.* and .*$/,
        [FilterTokenType.PARENTHESES]: /^\((.*)\)$/,
        [FilterTokenType.OR]: /^.* or .*$/,
        [FilterTokenType.EXISTS]: /^exists\((.*)\)$/,
        [FilterTokenType.NOT]: /^not\((.*)\)$/,
        [FilterTokenType.EQUALS]: /^[A-Za-z0-9]+\s*==\s*([0-9,.]+|'.*'|{[A-Za-z0-9.]+}|null|undefined)$/,
        [FilterTokenType.NOT_EQUALS]: /^[A-Za-z0-9]+\s*!=\s*([0-9,.]*|'.*'|{[A-Za-z0-9.]+}|null|undefined)$/,
    };

    private static readonly HANDLERS: Record<FilterTokenType, Function> = {
        [FilterTokenType.AND]: FilterService.handleAnd,
        [FilterTokenType.OR]: FilterService.handleOr,
        [FilterTokenType.EXISTS]: FilterService.handleExists,
        [FilterTokenType.EQUALS]: FilterService.handleEquals,
        [FilterTokenType.PARENTHESES]: FilterService.handleParanthesis,
        [FilterTokenType.NOT_EQUALS]: FilterService.handleNotEquals,
        [FilterTokenType.NOT]: FilterService.handleNot,
    };

    public static toSequelize<ENTITY extends DataObject<ENTITY>>(filter: AbstractFilter, entity: ConstructorOf<ENTITY>): FindOptions {
        const include: IncludeOptions[] = [];
        const where: WhereOptions = filter ? filter.toSequelize(entity, include) : {};
        return {
            where,
            include,
        };
    }

    public static stringToFilter(string: string): AbstractFilter {
        if (!string) {
            return Filter.true();
        }
        const trimmed: string = string.trim();
        if (!trimmed) {
            return Filter.true();
        }
        for (const [type, regexp] of Object.entries(this.EXPRESSIONS)) {
            if (trimmed.match(regexp)) {
                return this.HANDLERS[type].apply(this, [trimmed]);
            }
        }

        return Filter.false();
    }

    private static handleAnd(string: string): AbstractFilter {
        const tokens: string[] = string.split(" and ");
        return Filter.and(...tokens.map(t => this.stringToFilter(t)));
    }

    private static handleOr(string: string): AbstractFilter {
        const tokens: string[] = string.split(" or ");
        return Filter.or(...tokens.map(t => this.stringToFilter(t)));
    }

    private static handleParanthesis(string: string): AbstractFilter {
        return this.stringToFilter(string.replace(this.EXPRESSIONS.PARENTHESES, "$1"));
    }

    private static handleEquals(string: string): AbstractFilter {
        const tokens: string[] = string.split("==")
            .map(t => t.trim())
            .map(t => t.replace(/^'(.*)'$/, "$1"));
        return Filter.equals(tokens[0], this.parseValue(tokens[1]));
    }

    private static handleNotEquals(string: string): AbstractFilter {
        const tokens: string[] = string.split("!=")
            .map(t => t.trim())
            .map(t => t.replace(/^'(.*)'$/, "$1"));
        return Filter.not(Filter.equals(tokens[0], this.parseValue(tokens[1])));
    }

    private static handleExists(string: string): AbstractFilter {
        const tokens: string[] = string.replace(this.EXPRESSIONS.EXISTS, "$1")
            .split(",");
        return Filter.exists(tokens[0], tokens[1] ? this.stringToFilter(tokens[1]) : undefined);
    }

    private static handleNot(string: string): AbstractFilter {
        return Filter.not(this.stringToFilter(string.replace(this.EXPRESSIONS.NOT, "$1")));
    }

    private static parseValue(string: string): any {
        let value: any = string;
        if (value === "undefined") {
            value = undefined;
        } else if (value === "null") {
            value = null;
        } else if (value.match(this.IS_NUMBER)) {
            value = parseFloat(value);
        }

        return value;
    }
}
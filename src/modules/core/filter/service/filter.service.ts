import {ContextParameterMissingError, Filter} from "..";
import {FindOptions, IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Op} from "sequelize";
import {Enemene} from "../../../..";

export class FilterService {

    public static toSequelize(filter: Filter, context: any = {}): FindOptions {
        const include: IncludeOptions[] = [];
        const where: WhereOptions = this.toSequelizeInternal(filter, context, include);
        return {
            where,
            include,
        };
    }

    private static toSequelizeInternal(filter: Filter, context: any, includes: IncludeOptions[], prefix?: string): WhereOptions {
        switch (filter.name) {
            case "equals":
                if (prefix) {
                    return {[`\$${prefix}.${FilterService.replaceContext(filter.parameters[0], context)}\$`]: FilterService.replaceContext(filter.parameters[1], context)};
                } else {
                    return {[FilterService.replaceContext(filter.parameters[0], context)]: FilterService.replaceContext(filter.parameters[1], context)};
                }
            case "and":
                return {[Op.and]: filter.args.map(arg => FilterService.toSequelizeInternal(arg, context, includes, prefix))};
            case "or":
                return {[Op.or]: filter.args.map(arg => FilterService.toSequelizeInternal(arg, context, includes, prefix))};
            case "not":
                return {[Op.not]: FilterService.toSequelizeInternal(filter.args[0], context, includes, prefix)};
            case "exists":
                includes.push({
                    model: Enemene.app.db.model(filter.parameters[0]),
                    as: filter.parameters[1],
                    required: true,
                });
                if (filter.args.length) {
                    return FilterService.toSequelizeInternal(filter.args[0], context, includes, filter.parameters[1]);
                }
        }
        return {};
    }

    public static replaceContext(value: string | number, context: any): string | number {
        if (typeof value !== "string") {
            return value;
        }

        let result: any = value;

        const matches: RegExpMatchArray | null = result.match(/{[\w\d]+}/g);

        if (matches) {
            matches.forEach((match: string) => {
                const key: string = match.replace(/{([\w\d]+)}/, "$1");
                if (!context[key]) {
                    throw new ContextParameterMissingError(key);
                }
                result = result.replace(match, context[key]);
            });
        }

        if (result.match(/^\d+(\.\d+)?$/)) {
            return parseFloat(result);
        }

        return result;
    }
}

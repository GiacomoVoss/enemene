import {Filter} from "..";
import {FindOptions, IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {Op} from "sequelize";
import {Enemene} from "../../../..";
import {get} from "lodash";

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
                    return {[`\$${prefix}.${FilterService.replaceContextAsString(filter.parameters[0], context)}\$`]: FilterService.replaceContext(filter.parameters[1], context)};
                } else {
                    return {[FilterService.replaceContextAsString(filter.parameters[0], context)]: FilterService.replaceContext(filter.parameters[1], context)};
                }
            case "like":
                if (prefix) {
                    return {
                        [`\$${prefix}.${FilterService.replaceContextAsString(filter.parameters[0], context)}\$`]: {
                            [Op.like]: `%${FilterService.replaceContext(filter.parameters[1], context)}%`
                        }
                    };
                } else {
                    return {
                        [FilterService.replaceContextAsString(filter.parameters[0], context)]: {
                            [Op.like]: `%${FilterService.replaceContext(filter.parameters[1], context)}%`
                        }
                    };
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

    private static replaceContextAsString(value: string | number, context: any): string {
        if (typeof value !== "string") {
            return `${value}`;
        }

        let result: any = value;

        const matches: RegExpMatchArray | null = result.match(/{[\w\d.]+}/g);

        if (matches) {
            matches.forEach((match: string) => {
                const key: string = match.replace(/{([\w\d.]+)}/, "$1");
                const replacementValue: string | number = get(context, key);
                if (!replacementValue) {
                    return null;
                }
                result = result.replace(match, replacementValue);
            });
        }

        return result;
    }

    private static replaceContext(value: string | number, context: any): string | number | boolean {
        if (typeof value !== "string") {
            return value;
        }

        let result: any = this.replaceContextAsString(value, context);

        if (result === "true") {
            return true;
        }

        if (result === "false") {
            return false;
        }

        if (result.match(/^\d+(\.\d+)?$/)) {
            return parseFloat(result);
        }

        return result;
    }
}

import {IncludeOptions, WhereOptions} from "sequelize/types/lib/model";
import {CompositionField} from "../../model/interface/composition-field.class";
import {ModelService} from "../../model/service/model.service";
import {UnsupportedOperationError} from "../../error/unsupported-operation.error";
import chalk from "chalk";
import {Enemene} from "../../../..";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {get} from "lodash";
import {AbstractFilter} from "./abstract-filter.class";
import {Op} from "sequelize";
import {ReferenceField} from "../../model/interface/reference-field.class";

export class FilterExists extends AbstractFilter {
    constructor(private field: string,
                private arg?: AbstractFilter) {
        super();
    }

    public toSequelize(entity, includes: IncludeOptions[], prefix?: string): WhereOptions {
        const entityField: CompositionField | ReferenceField = ModelService.getFields(entity.name)[this.field];
        if (!entityField) {
            throw new UnsupportedOperationError(`Unknown field ${chalk.bold(this.field)} in entity ${chalk.bold(entity.name)}.`);
        }
        if (!entityField.classGetter) {
            return {
                [entityField.name]: {
                    [Op.ne]: null,
                }
            };
        }

        includes.push({
            model: Enemene.app.db.model(entityField.classGetter().name),
            as: this.field,
            required: false,
        });

        if (this.arg) {
            return this.arg.toSequelize(entityField.classGetter(), includes, this.field);
        } else {
            return {
                [entityField.foreignKey]: {
                    [Op.ne]: null,
                }
            };
        }
    }

    evaluate(object: Dictionary<serializable>): boolean {
        const subObject: Dictionary<serializable> = get(object, this.field, null);
        if (subObject === null) {
            return false;
        }
        if (this.arg) {
            return this.arg.evaluate(subObject);
        }

        return true;
    }
}

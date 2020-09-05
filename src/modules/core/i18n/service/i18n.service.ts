import {EntityModel} from "../../model/type/entity-model.type";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../../..";

export class I18nService {

    public static parseEntityModel(entityModel: EntityModel, language: string): Dictionary<serializable> {
        return Object.keys(entityModel).reduce((result: Dictionary<serializable>, entity: string) => {
            if (entity === "$root") {
                result[entity] = entityModel[entity];
            } else {
                result[entity] = {};
                Object.keys(entityModel[entity]).forEach((field: string) => {
                    const fieldJson: Dictionary<serializable> = entityModel[entity][field].toJSON();
                    fieldJson.label = this.getI18nizedString(fieldJson.label as string | string[], language);
                    result[entity][field] = fieldJson;
                });
            }
            return result;
        }, {});
    }

    public static getI18nizedString(labels: string | string[], language?: string): string {
        if (!Array.isArray(labels)) {
            return labels;
        }

        if (!language || !Enemene.app.config.languages) {
            return labels[0];
        }

        const index: number = Enemene.app.config.languages.indexOf(language);
        if (index === -1 || !labels[index]) {
            Enemene.log.warn(this.constructor.name, `Unsupported language ${language} requested.`);
            return labels[0];
        }

        return labels[index];
    }
}

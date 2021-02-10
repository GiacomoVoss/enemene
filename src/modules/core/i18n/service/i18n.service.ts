import {Dictionary} from "../../../../base/type/dictionary.type";
import {serializable} from "../../../../base/type/serializable.type";
import {Enemene} from "../../../..";
import {EntityField} from "../../model/interface/entity-field.class";

export class I18nService {

    public static parseEntityModel(entityModel: Dictionary<EntityField>, language: string): Dictionary<serializable> {
        return Object.keys(entityModel).reduce((viewResult: Dictionary<serializable>, field: string) => {
            const fieldJson: Dictionary<serializable> = entityModel[field].toJSON();
            fieldJson.label = this.getI18nizedString(fieldJson.label as string | string[], language);
            viewResult[field] = fieldJson;
            return viewResult;
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

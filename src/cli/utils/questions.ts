import inquirer, {DistinctQuestion} from "inquirer";
import {Dictionary} from "../../base/type/dictionary.type";
import {getModels} from "./files";
import {lowerFirst, upperFirst} from "lodash";

export async function ask(question: DistinctQuestion): Promise<any> {
    return (await inquirer.prompt({
        ...question,
        name: "ask",
    })).ask;
}


export async function askForField(entityName: string): Promise<FieldDefinition | null> {
    const field = await ask({
        type: "input",
        message: "Enter a field to create (enter nothing to finish)",
    });
    if (!field.length) {
        return null;
    }
    const fieldType = await ask({
        type: "list",
        message: "Enter field type",
        choices: Object.values(FieldType),
    });

    let dataType: EntityFieldType;
    let entityPath: string;
    let foreignKey: string;
    let throughType: string;
    let throughPath: string;
    let required: boolean = false;

    if (fieldType === FieldType.Field) {
        dataType = await ask({
            type: "list",
            message: "Enter field data type",
            choices: Object.values(EntityFieldType),
        });
    } else {
        const entities: Dictionary<string> = await getModels();
        dataType = await ask({
            type: "list",
            message: "Choose the referenced entity",
            choices: Object.keys(entities),
        });

        entityPath = entities[dataType];

        if (fieldType === FieldType.Collection) {
            foreignKey = await ask({
                type: "input",
                message: "Name the foreign key on the target entity",
                default: `${lowerFirst(entityName)}Id`,
            });
        }

        if (fieldType === FieldType.ManyToMany) {
            throughType = await ask({
                type: "list",
                message: "Choose the entity the ManyToMany-Relation is represented by",
                choices: Object.keys(entities),
            });
            throughPath = entities[throughType];
        }

        if ([FieldType.Field, FieldType.Reference, FieldType.Composition].includes(fieldType)) {
            required = await ask({
                type: "confirm",
                message: "Should this field be required?",
            });
        }
    }

    const label: string = await ask({
        type: "input",
        message: "Define a label",
        default: upperFirst(field),
    });

    return {
        field,
        fieldType,
        dataType,
        label,
        entityPath,
        foreignKey,
        throughType,
        throughPath,
        required,
    };
}

export interface FieldDefinition {
    field: string;
    fieldType: FieldType;
    dataType: EntityFieldType;
    label: string;
    entityPath?: string;
    foreignKey?: string;
    throughType?: string;
    throughPath?: string;
    required: boolean;
}

export enum FieldType {
    Field = "Field",
    Reference = "Reference",
    Collection = "Collection",
    Composition = "Composition",
    ManyToMany = "ManyToMany",
}

export enum EntityFieldType {
    STRING = "STRING",
    UUID = "UUID",
    EMAIL = "EMAIL",
    STRING_ARRAY = "STRING_ARRAY",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    REFERENCE = "REFERENCE",
    COMPOSITION = "COMPOSITION",
    COLLECTION = "COLLECTION",
}

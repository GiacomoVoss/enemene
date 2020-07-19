import chalk from "chalk";
import {ask, askForField, FieldDefinition} from "./utils/questions";
import path from "path";
import {kebabCase, uniq, upperFirst} from "lodash";
import {Spinner} from "clui";
import mkdirp from "mkdirp";
import {createFromTemplate, getModelNameFromFile} from "./utils/files";

export async function createEntity() {

    console.log(chalk.yellow("Creating new entity ✨"));
    let entityName: string = await ask({
        type: "input",
        message: "Define an entity name",
    });
    entityName = upperFirst(entityName);
    const entityPath: string = await ask({
        type: "input",
        message: "Which directory should the entity be put in?",
        default: "src/model",
    });

    const fields: FieldDefinition[] = [];
    let finish: boolean = false;
    do {
        const field: FieldDefinition | null = await askForField(entityName);

        if (field) {
            fields.push(field);
            console.log(chalk.green(`Registered field ${chalk.bold(field.field)}.`));
        } else {
            finish = true;
        }
    } while (!finish);

    const filePath = path.resolve(process.cwd(), entityPath, `${kebabCase(entityName)}.model.ts`);
    const fieldTypes: string[] = uniq(fields.map(f => f.fieldType));
    fieldTypes.sort((a, b) => a.localeCompare(b));

    const status = new Spinner(chalk.yellow(`Creating `) + chalk.bold(filePath));
    status.start();
    await mkdirp(path.resolve(process.cwd(), entityPath));

    const additionalImports: string[] = uniq([...fields.map(f => f.entityPath), ...fields.map(f => f.throughPath)])
        .filter(file => !!file)
        .map(file => {
            let relativePath: string = path.relative(entityPath, file).replace(/\.ts$/, "");
            if (!relativePath.startsWith(".")) {
                relativePath = `./${relativePath}`;
            }
            return [getModelNameFromFile(file), relativePath];
        })
        .map(([model, file]) => `import { ${model} } from "${file}";`);
    createFromTemplate("entity", filePath, {
        entityName,
        fields,
        fieldTypes: fieldTypes.length ? fieldTypes.join(", ") : undefined,
        additionalImports,
    });
    status.stop();
    console.log(chalk.green(`Created ${chalk.bold(filePath)}`));
}

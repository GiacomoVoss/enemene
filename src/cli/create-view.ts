import chalk from "chalk";
import {Dictionary} from "../base/type/dictionary.type";
import {createFromTemplate, getModelNameFromFile, getModels} from "./utils/files";
import {ask} from "./utils/questions";
import path from "path";
import {kebabCase} from "lodash";
import {Spinner} from "clui";
import mkdirp from "mkdirp";

export async function createView() {

    console.log(chalk.yellow("Creating a new view ✨"));
    const models: Dictionary<string> = await getModels();
    const choices: any[] = Object.entries(models).map(([key, value]) => ({name: key, value}));
    choices.sort((o1, o2) => o1.name.localeCompare(o2.name));
    const absoluteEntityPath: string = await ask({
        type: "list",
        message: "Which entity should be the base for this view?",
        choices,
    });
    const entityPath: string = path.relative(process.cwd(), absoluteEntityPath);
    const entity: string = getModelNameFromFile(entityPath);

    const fields: string[] = [];
    let finish: boolean = false;
    do {
        const input = await ask({
            type: "input",
            message: "Enter a field to include (enter nothing to finish)",
        });
        if (input.length) {
            fields.push(input);
        } else {
            finish = true;
        }
    } while (!finish);

    const viewName: string = await ask({
        type: "input",
        message: "Decide a view name",
        default: `${entity}View`,
        validate(input: string): boolean | string {
            if (input.endsWith("View")) {
                return true;
            } else {
                return "Name should end with \"View\".";
            }
        }
    });

    const filePath = path.resolve(process.cwd(), entityPath, "..", "..", "view", `${kebabCase(viewName).replace(/-view$/, ".view")}.ts`);
    const status = new Spinner(chalk.yellow(`Creating `) + chalk.bold(filePath));
    status.start();
    await mkdirp(path.resolve(process.cwd(), entityPath, "..", "..", "view"));
    createFromTemplate("view", filePath, {
        viewName,
        entity,
        entityPath: path.relative(path.dirname(filePath), entityPath).replace(/\.ts$/, ""),
        fields,
    });
    status.stop();
    console.log(chalk.green(`Created ${chalk.bold(filePath)}`));
}

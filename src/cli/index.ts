#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import {createView} from "./create-view";
import {createEntity} from "./create-entity";
import Handlebars from "handlebars";
import {fieldAnnotationHelper, isPluralFieldHelper, typescriptTypeForEntityFieldType} from "./utils/helpers";

async function run() {

    Handlebars.registerHelper("fieldAnnotation", fieldAnnotationHelper);
    Handlebars.registerHelper("isPluralField", isPluralFieldHelper);
    Handlebars.registerHelper("typescriptTypeForEntityFieldType", typescriptTypeForEntityFieldType);

    clear();
    const args = process.argv.slice(2);
    switch (args[0]) {
        case "miew":
            await createView();
            break;
        case "mentity":
            await createEntity();
            break;
        default:
            console.log(chalk.red(`Invalid argument. Provide one of the following: ${chalk.bold("miew, mentity")}`));
            process.exit(1);
            break;
    }
    console.log(chalk.green("Hex hex!"));
}

run();

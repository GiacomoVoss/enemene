#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import {createView} from "./create-view";
import {createEntity} from "./create-entity";
import Handlebars from "handlebars";
import {fieldAnnotationHelper, isPluralFieldHelper} from "./utils/helpers";

async function run() {

    Handlebars.registerHelper("fieldAnnotation", fieldAnnotationHelper);
    Handlebars.registerHelper("isPluralField", isPluralFieldHelper);

    clear();
    const args = process.argv.slice(2);
    const possibleArgs = ["miew", "mentity"];

    switch (args[0]) {
        case "miew":
            await createView();
            break;
        case "mentity":
            await createEntity();
            break;
        default:
            console.log(chalk.red(`Invalid argument. Provide one of the following: ${possibleArgs.map(chalk.bold)}`));
            break;
    }
    console.log(chalk.green("Hex hex!"));
}

run();

import chalk from "chalk";
import {FileService} from "../modules/core/file/service/file.service";
import path from "path";
import {Dictionary} from "../base/type/dictionary.type";
import {ask} from "./utils/questions";
import * as fs from "fs";
import {PopulatorRunner} from "../populator/class/populator-runner.class";
import {PopulatorConfig} from "../populator/interface/populator-config.interface";

export async function populate() {
    const populatorJson: string = path.join(process.cwd(), "populator.json");
    console.log(chalk.yellow("Executing populator ✨"));

    const fileService: FileService = new FileService();

    let config: Partial<PopulatorConfig> = {};

    if (fs.existsSync(populatorJson)) {
        config = require(populatorJson);
        console.log(chalk.green(`Using configuration from ${chalk.bold("populator.json")} file.`));
    }

    let configChanged: boolean = false;

    if (!config.url) {
        config.url = await ask({
            type: "input",
            message: "Provide the url to send the requests to",
        });
        configChanged = true;
    }

    if (config.reinitDb === undefined) {
        config.reinitDb = await ask({
            type: "confirm",
            message: "Re-initialize the database?",
            default: config.url.includes("localhost"),
        });
        configChanged = true;
    }

    if (configChanged) {
        const confirmWriteConfig: boolean = await ask({
            type: "confirm",
            message: `Write config to ${chalk.bold("populator.json")}?`
        });
        if (confirmWriteConfig) {
            fs.writeFileSync(path.join(process.cwd(), "populator.json"), JSON.stringify(config, undefined, 2));
            console.log(chalk.green(`Writing configuration to ${chalk.bold("populator.json")}.`));
        }
    }

    console.log("Searching for scenarios...");

    const scenarios: Dictionary<string> = fileService.scanForFilePattern(path.join(process.cwd()), /.*\.populator\.js$/).reduce((map: Dictionary<string>, fileName: string) => {
        const scenarioName: string = fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf(".populator"));
        map[scenarioName] = fileName;
        return map;
    }, {});


    const choices: any[] = Object.entries(scenarios).map(([key, value]) => ({name: key, value}));
    if (!choices.length) {
        throw Error(`No populator scenarios found. Create scenarios ending with ${chalk.bold(".populator.ts")} and recompile the application.`);
    }
    choices.sort((o1, o2) => o1.name.localeCompare(o2.name));

    let absoluteScenarioPaths: string[] = await ask({
        type: "checkbox",
        message: "Select the scenarios to execute.",
        choices,
    });

    let confirmMessage: string = `Executing ${absoluteScenarioPaths.length} scenarios on ${chalk.bold(config.url)}, are you sure?`;
    if (config.reinitDb) {
        confirmMessage += chalk.bold(chalk.red(" DANGER: The entire database will be dropped and recreated!"));
    }
    const confirm: boolean = await ask({
        type: "confirm",
        message: confirmMessage,
    });

    if (!confirm) {
        process.exit();
    }

    const populatorRunner: PopulatorRunner = new PopulatorRunner();

    await populatorRunner.run(absoluteScenarioPaths, config as PopulatorConfig);
}
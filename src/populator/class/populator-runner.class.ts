import chalk from "chalk";
import {Dictionary} from "../../base/type/dictionary.type";
import {ConstructorOf} from "../../base/constructor-of";
import {TestScenario} from "../interface/test-scenario.interface";
import {CommandRunner} from "./command-runner.class";
import {Populator} from "./populator.class";
import {PopulatorConfig} from "../interface/populator-config.interface";
import axios from "axios";

export class PopulatorRunner {

    public async run(absoluteScenarioPaths: string[], config: PopulatorConfig) {
        let url: string = config.url;
        if (url.endsWith("/")) {
            url = url.substring(-1);
        }
        let token: string;
        try {
            const auth = await axios.post(`${url}/api/auth/login`, {
                username: "populator",
                password: "populator",
                populator: true,
            });
            token = auth.data;
        } catch (e) {
            console.log(chalk.red(`Cannot login to ${chalk.bold(config.url)}. Please start your server in dev mode to enable populator requests.`));
            process.exit(1);
        }

        if (config.reinitDb) {
            console.log("Reinitializing the database..");
            try {
                await axios.post(`${config.url}/api/dev/reinit-db`, undefined, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (e) {
                console.log(chalk.red(`Database reinitialization at ${chalk.bold("/api/dev/reinit-db")} failed.`));
                process.exit(1);
            }
        }

        for (const scenarioPath of absoluteScenarioPaths) {
            console.log(chalk.yellow(`Running ${scenarioPath}...`));
            const modules: Dictionary<ConstructorOf<TestScenario>> = await import(scenarioPath);

            const commandRunner: CommandRunner = new CommandRunner(config.url, token);

            for (const moduleClass of Object.values(modules)) {
                const scenario: TestScenario = new moduleClass();
                if (scenario.run) {
                    const populator: Populator = scenario.run();
                    await populator.run(commandRunner);
                }
            }
        }
    }
}
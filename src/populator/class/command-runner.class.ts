import axios from "axios";
import {CommandDefinition} from "../interface/command-definition.interface";
import {Command} from "../interface/command.interface";
import {uuid} from "../../base/type/uuid.type";
import {CommandExecutionFailedException} from "../error/command-execution-failed.error";

export class CommandRunner {

    constructor(private url: string,
                private token: string) {
    }

    public async execute(commandDefinition: CommandDefinition, commandSeed: string): Promise<string | undefined> {
        if (commandDefinition.shouldExecute && !commandDefinition.shouldExecute(commandSeed)) {
            return undefined;
        }

        const command: Command = commandDefinition.commandSupplier(commandSeed);
        const aggregateId: uuid | undefined = commandDefinition.objectIdSupplier?.(commandSeed);
        let url: string = this.url + `/api/${command.endpoint}`.replace("//", "/");
        if (aggregateId) {
            url += "/" + aggregateId;
        }

        return this.executeCommand(url, command.method, command.data);
    }

    private async executeCommand(url: string, method: "UPDATE" | "CREATE", data: any): Promise<string> {
        const requestMethod = method === "UPDATE" ? axios.put : axios.post;
        try {
            await requestMethod(url, data, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
            });
        } catch (e) {
            throw new CommandExecutionFailedException(url, e);
        }

        return `${method} ${url}`;
    }
}
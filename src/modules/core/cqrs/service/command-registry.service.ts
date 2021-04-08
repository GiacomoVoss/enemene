import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractCommand} from "../class/abstract-command.class";
import {FileRegistryService} from "../../service/file-registry.service";

export class CommandRegistryService extends FileRegistryService {

    private commands: Dictionary<ConstructorOf<AbstractCommand>> = {};

    async init(): Promise<void> {
        (await this.loadFiles(/.*\.command\.js/, await import("../command"))).forEach((command: ConstructorOf<AbstractCommand>) => {
            const endpoint: string = new command().$endpoint;
            if (this.commands[endpoint]) {
                throw new Error("Duplicate command endpoint: " + endpoint);
            }
            this.commands[new command().$endpoint] = command;
        });
    }

    createCommand(commandEndpoint: string, data: any): AbstractCommand {
        const commandClass: ConstructorOf<AbstractCommand> = this.commands[commandEndpoint];
        const command: AbstractCommand = new commandClass();
        command.populate(data);
        return command;
    }
}
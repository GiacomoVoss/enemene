import {Enemene} from "../../application";
import {Dictionary} from "../../../../base/type/dictionary.type";
import {ConstructorOf} from "../../../../base/constructor-of";
import {FileService} from "../../file/service/file.service";
import {AbstractCommand} from "../class/abstract-command.class";

export class CommandRegistryService {

    private fileService: FileService = Enemene.app.inject(FileService);

    private commands: Dictionary<ConstructorOf<AbstractCommand>> = {};

    async init(): Promise<void> {
        const commandFiles: string[] = this.fileService.scanForFilePattern(Enemene.app.config.modulesPath, /.*\.command\.js/);
        const commandModules: Dictionary<ConstructorOf<AbstractCommand>>[] = await Promise.all(commandFiles.map((filePath: string) => import(filePath)));

        const systemModules = await import("../command");

        [systemModules, ...commandModules].forEach((moduleMap: Dictionary<ConstructorOf<AbstractCommand>>) => {
            Object.values(moduleMap).forEach((command: ConstructorOf<AbstractCommand>) => {
                const endpoint: string = new command().$endpoint;
                if (this.commands[endpoint]) {
                    throw new Error("Duplicate command endpoint: " + endpoint);
                }
                this.commands[new command().$endpoint] = command;
                console.log(command.prototype.$parameters);
            });
        });
    }

    createCommand(commandEndpoint: string, data: any): AbstractCommand {
        const commandClass: ConstructorOf<AbstractCommand> = this.commands[commandEndpoint];
        const command: AbstractCommand = new commandClass();
        command.populate(data);
        return command;
    }
}
import {ConstructorOf} from "../../../../base/constructor-of";
import {AbstractCommand} from "../class/abstract-command.class";
import {Aggregate} from "../class/aggregate.class";
import {CommandHandlerDefinition} from "../interface/command-handler-definition.interface";

export function CommandHandler(commandType: ConstructorOf<AbstractCommand>, isPublic: boolean = false): Function {
    return function (target: new () => Aggregate, key: string, descriptor: PropertyDescriptor): void {
        const handlers: CommandHandlerDefinition[] = target.constructor.prototype.$commandHandlers || [];

        handlers.push({
            endpoint: new commandType().$endpoint,
            handler: descriptor.value,
            isPublic,
        });

        target.constructor.prototype.$commandHandlers = handlers;
    };
}
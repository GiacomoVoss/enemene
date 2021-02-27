import {uuid} from "../../base/type/uuid.type";
import {Command} from "./command.interface";
import {PopulatorSequenceElement} from "./populator-sequence-element.interface";
import {SeededFunction} from "../type/seeded-function.type";
import {Predicate} from "../type/predicate.type";

export class CommandDefinition implements PopulatorSequenceElement {

    constructor(public objectIdSupplier: SeededFunction<uuid> | undefined,
                public commandSupplier: SeededFunction<Command>,
                public shouldExecute?: Predicate,
                public name?: string) {
    }
}

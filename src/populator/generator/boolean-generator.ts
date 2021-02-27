import {AbstractGenerator} from "../interface/abstract-generator.interface";
import {Populator} from "../class/populator.class";

export class BooleanGenerator implements AbstractGenerator<boolean> {

    public generate(seed: string): boolean {
        return !!Populator.randomInt(seed, 0, 1);
    }
}

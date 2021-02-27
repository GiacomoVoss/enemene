import {AbstractGenerator} from "../interface/abstract-generator.interface";

export class GetFromListGenerator<TYPE> implements AbstractGenerator<TYPE> {

    private index: number = 0;

    constructor(private readonly values: TYPE[]) {
    }

    public generate(seed: string): TYPE {
        return this.values[this.index++ % this.values.length];
    }
}

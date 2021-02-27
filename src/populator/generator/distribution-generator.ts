import {AbstractGenerator} from "../interface/abstract-generator.interface";
import {flatMap, sortBy} from "lodash";
import {Populator} from "../class/populator.class";

export class DistributionGenerator<TYPE> implements AbstractGenerator<TYPE> {

    private readonly possibilities: TYPE[] = [];

    constructor(distributions: [TYPE, number][]) {
        const distributionsSorted: [TYPE, number?][] = sortBy(distributions, d => d[1]);
        this.possibilities = flatMap(distributionsSorted, d => {
            const values: TYPE[] = [];
            for (let i = 0; i < d[1]; i++) {
                values.push(d[0]);
            }
            return values;
        });
    }

    public generate(seed: string): TYPE {
        return this.possibilities[Populator.randomInt(seed, 0, this.possibilities.length)];
    }
}

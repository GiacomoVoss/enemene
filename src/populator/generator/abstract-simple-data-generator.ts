import {AbstractGenerator} from "../interface/abstract-generator.interface";
import * as fs from "fs";
import {Populator} from "../class/populator.class";

export abstract class AbstractSimpleDataGenerator<TYPE> implements AbstractGenerator<TYPE> {

    private data: TYPE[] = [];

    /**
     * Generates a random value based on the given seed.
     *
     * @param seed The seed to base the randomness on.
     * @return The generated value.
     */
    public generate(seed: string): TYPE {
        const elements: TYPE[] = this.getData();
        if (elements.length == 0) {
            return null;
        }

        return this.getRandomEntry(seed, elements);
    }


    /**
     * Override this method to return the path of the source file for elements. Every line in the text file represents one element.
     */
    protected abstract getFilePath(): string;

    /**
     * Override this method to convert a given source file line to the type of element this generator returns. Every line in the text file
     * represents one element.
     *
     * @param line The file line to convert.
     * @return The converted object.
     */
    protected abstract convert(line: string): TYPE;

    protected getData(): TYPE[] {
        if (!this.data.length) {
            this.loadData(this.getFilePath(), this.data);
        }

        return this.data;
    }

    /**
     * Loads data from the given resource file in the class path and saves it to to the given list.
     */
    protected loadData(filePath: string, data: TYPE[]): void {
        const content: string = fs.readFileSync(filePath).toString();
        data.push(...content.split("\n").map(this.convert));
    }


    /**
     * Gets a random entry from the given list of elements.
     *
     * @param seed     The seed to base the randomness on.
     * @param elements The list of elements to pick from.
     * @return The randomly selected object.
     */
    protected getRandomEntry(seed: string, elements: TYPE[]): TYPE {
        return elements[Populator.randomInt(seed, 0, elements.length)];
    }
}

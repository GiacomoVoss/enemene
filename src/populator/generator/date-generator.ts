import {AbstractGenerator} from "../interface/abstract-generator.interface";
import {Populator} from "../class/populator.class";

export class DateGenerator implements AbstractGenerator<Date> {

    private static MAX_DATE: number = 8640000000000000;
    private static MIN_DATE: number = -8640000000000000;

    public generate(seed: string, from?: Date, to?: Date): Date {
        const fromValue: number = from?.getTime() ?? DateGenerator.MIN_DATE;
        const toValue: number = to?.getTime() ?? DateGenerator.MAX_DATE;
        return new Date(Populator.randomInt(seed, fromValue, toValue));
    }
}

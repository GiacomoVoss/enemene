/**
 * Use this class to generate commands to populate the system with test data.
 */
import {uuid} from "./base";

export declare type SeededFunction<T> = (seed: string) => T;
export declare type Predicate = (seed: string) => boolean;

export interface Command {
    endpoint: string;

    method: "UPDATE" | "CREATE";

    data: any;
}

export interface TestScenario {

    run(): Populator;
}

export declare class Populator {

    /**
     * The seed which is used to create deterministic values. When using the same seed, the populator uses the same data.
     */
    public readonly seed: string;

    constructor(seed?: string);

    /**
     * Creates a generator for distributing a given list of elements based on the given distributions.
     *
     * @param distributions A map of elements to distribute as keys and the distribution value as value.
     * @return A generator function of a {@link DistributionGenerator}.
     */
    public static distribution<TYPE>(distributions: TYPE[] | [TYPE, number][]): SeededFunction<TYPE>;


    /**
     * Creates a generator to pick values from the list one after another.
     *
     * @param values The list of values to pick from.
     * @return A generator function of a {@link GetFromListGenerator}.
     */
    public static getFromList<TYPE>(values: TYPE[]): SeededFunction<TYPE>;

    /**
     * Register an asynchronously initialized generator, e.g. a generator that relies on parsing a file.
     * @param generator {AbstractSimpleDataGenerator<any>} The generator.
     */
    public registerAsyncGenerator(generator: AbstractSimpleDataGenerator<any>): Populator;

    /**
     * Define a generator function that generates a new value in each iteration based on the given iteration seed.
     */
    public define(variableName: string, generator: SeededFunction<any>): Populator;


    /**
     * Get a value from a variable set by {@link Populator::define}.
     */
    public get<TYPE>(key: string): TYPE;

    /**
     * Get a result from a previously executed command.
     * @param commandName {string} The command name to get the result from.
     */
    public getResult(commandName: string): string;

    /**
     * Returns the generator with the given key, previously defined with {@link Populator::defineGenerator}.
     */
    public getGenerator<TYPE>(key: string): SeededFunction<TYPE>;

    /**
     * Define a command to execute.
     * @param objectIdSupplier {SeededFunction<uuid> | uuid} A UUID or a supplier function to generate a uuid to access a definitive object.
     * @param commandSupplier {SeededFunction<Command>} A function to generate a command.
     * @param shouldExecute {Predicate} An optional predicate to evaluate if the command should be executed.
     */
    public command(objectIdSupplier: SeededFunction<uuid> | uuid | undefined,
                   commandSupplier: SeededFunction<Command>,
                   shouldExecute?: Predicate): Populator;

    public times(min?: number, max?: number): Populator;

    public times(times?: number): Populator;

    public sequence(sequenceFunction: (populator: Populator) => Populator): Populator;
}

export declare class BooleanGenerator implements AbstractGenerator<boolean> {
    public generate(seed: string): boolean;
}

export declare class UuidGenerator implements AbstractGenerator<uuid> {
    public generate(seed: string): uuid;
}

export declare class DateGenerator implements AbstractGenerator<Date> {

    public generate(seed: string, from?: Date, to?: Date): Date;
}

export interface AbstractGenerator<TYPE> {
    generate(seed: string): TYPE;
}

export declare abstract class AbstractSimpleDataGenerator<TYPE> implements AbstractGenerator<TYPE> {

    /**
     * Generates a random value based on the given seed.
     *
     * @param seed The seed to base the randomness on.
     * @return The generated value.
     */
    public generate(seed: string): TYPE;


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

    protected getData(): TYPE[];

    /**
     * Loads data from the given resource file in the class path and saves it to to the given list.
     */
    protected loadData(filePath: string, data: TYPE[]): void;


    /**
     * Gets a random entry from the given list of elements.
     *
     * @param seed     The seed to base the randomness on.
     * @param elements The list of elements to pick from.
     * @return The randomly selected object.
     */
    protected getRandomEntry(seed: string, elements: TYPE[]): TYPE;
}

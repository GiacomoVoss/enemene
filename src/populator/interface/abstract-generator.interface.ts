export interface AbstractGenerator<TYPE> {
    generate(seed: string): TYPE;
}

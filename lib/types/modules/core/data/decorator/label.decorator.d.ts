import "reflect-metadata";
export declare function Label(label: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function getLabel(target: any, propertyKey: string): any;

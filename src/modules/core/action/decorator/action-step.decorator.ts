import {Dictionary} from "../../../../base/type/dictionary.type";

export function ActionStep(index: number, label: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        const steps: Dictionary<any> = target.constructor.prototype.$steps || {};

        steps[index] = {
            label,
            index,
            value: descriptor.value,
        };

        target.constructor.prototype.$steps = steps;
    };
}

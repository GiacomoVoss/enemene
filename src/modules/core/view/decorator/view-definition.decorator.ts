import {View, ViewDefinitionConfiguration} from "..";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../types/base";
import * as vdClass from "../class/view-definition.class";

export function ViewDefinition<ENTITY extends DataObject<ENTITY>>(entity: ConstructorOf<ENTITY>, configuration: ViewDefinitionConfiguration<any>): Function {
    return function (target: ConstructorOf<View<ENTITY>>) {
        target.prototype.$view = new vdClass.ViewDefinition(
            entity,
            target,
            target.prototype.$fields,
            configuration
        );
    };
}

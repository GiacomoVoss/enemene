import {View, ViewDefinitionConfiguration, ViewInitializerService} from "..";
import {DataObject} from "../../model";
import {ConstructorOf} from "../../../../types/base";
import * as vdClass from "../class/view-definition.class";
import {uuid} from "../../../../base/type/uuid.type";

export function ViewDefinition<ENTITY extends DataObject<ENTITY>>(id: uuid, entity: () => ConstructorOf<ENTITY>, configuration?: ViewDefinitionConfiguration<any>): Function {
    return function (target: ConstructorOf<View<ENTITY>>) {
        target.prototype.$view = new vdClass.ViewDefinition(
            id,
            entity,
            target,
            target.prototype.$fields,
            configuration
        );
        ViewInitializerService.addViewClass(target);
    };
}

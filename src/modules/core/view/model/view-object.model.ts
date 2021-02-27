import {Field} from "../../model";
import {VirtualObject} from "../../model/class/virtual-object.model";
import {Enemene} from "../../application";
import {ViewInitializerService} from "../service/view-initializer.service";
import {uuid} from "../../../../base/type/uuid.type";

export class ViewObject extends VirtualObject<ViewObject> {

    $displayPattern = "{name}";
    
    id: uuid;

    @Field("Name")
    name: string;

    protected getObjects(): ViewObject[] {
        return Object.entries(Enemene.app.inject(ViewInitializerService).getAllViews())
            .map(([id, viewDefinition]) => {
                const view: ViewObject = new ViewObject();
                view.id = id;
                view.name = viewDefinition.name;
                return view;
            });
    }
}
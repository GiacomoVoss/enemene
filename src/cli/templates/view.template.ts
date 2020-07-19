export default `import { View } from "enemene";
import { {{entity}} } from "{{entityPath}}";

export const {{viewName}}: View<{{entity}}> = {
    entity: () => {{entity}},
    fields: [
        {{#each fields}}
        "{{this}}",
        {{/each}}
    ]
}`;

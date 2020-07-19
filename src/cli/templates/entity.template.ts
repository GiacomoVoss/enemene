export default `import { DataObject, Entity{{#if fieldTypes}}, {{fieldTypes}}{{/if}} } from "enemene";
{{#each additionalImports}}{{{this}}}
{{/each}}

@Entity
export class {{entityName}} extends DataObject<{{entityName}}> {

    {{#each fields}}
    {{{fieldAnnotation this}}}
    {{this.field}}: {{this.dataType}}{{#if (isPluralField this)}}[]{{/if}};
    
    {{/each}}
}
`;

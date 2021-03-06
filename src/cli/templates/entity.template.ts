export default `import { DataObject, Entity, EntityFieldType{{#if fieldTypes}}, {{fieldTypes}}{{/if}} } from "enemene";
{{#each additionalImports}}{{{this}}}
{{/each}}

@Entity
export class {{entityName}} extends DataObject<{{entityName}}> {

    {{#each fields}}
    {{{fieldAnnotation this}}}
    {{this.field}}: {{typescriptTypeForEntityFieldType this}}{{#if (isPluralField this)}}[]{{/if}};
    
    {{/each}}
}
`;

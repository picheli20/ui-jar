import * as ts from 'typescript';
import { ModuleDocs } from './module-parser';
import { TestExample } from './test-source-parser';
export interface SourceDocs {
    componentRefName: string;
    componentDocName: string;
    groupDocName: string;
    examples: TestExample[];
    description: string;
    fileName: string;
    moduleDetails: ModuleDetails;
    apiDetails: ApiDetails;
    exampleTemplate?: string;
    selector: string;
    extendClasses: string[];
    source: string;
}
export interface ApiDetails {
    properties: ApiComponentProperties[];
    methods: any[];
}
export interface ApiComponentProperties {
    decoratorNames: string[];
    propertyName: string;
    type: string;
    description: string;
}
export interface ModuleDetails {
    moduleRefName: string;
    fileName: string;
}
export interface ProjectSourceDocs {
    classesWithDocs: SourceDocs[];
    otherClasses: SourceDocs[];
}
export declare class ComponentParser {
    private config;
    private program;
    private checker;
    constructor(config: {
        rootDir: string;
        files: string[];
    }, program: ts.Program);
    getComponentDocs(componentFiles: string[], moduleDocs: ModuleDocs[]): ProjectSourceDocs;
    private getModuleDetailsToComponent;
    private getComponentSourceData;
    private getComponentSelector;
    private getComponentSourceCode;
    private getClassMemberDetails;
    private getMethodToDetails;
    private getMethodParametersAsString;
    private checkIfSymbolHasPrivateModifier;
    private getAccessorDeclarationToDetails;
    private getPropertyToDetails;
    private getNodeComment;
    private getPropertiesFromExtendedComponentClasses;
}

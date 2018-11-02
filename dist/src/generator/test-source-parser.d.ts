import * as ts from 'typescript';
import { SourceDocs } from './component-parser';
export interface VariableDeclaration {
    type: string;
    name: string;
    value: string;
}
export interface InlineClass {
    source: string;
    name: string;
}
export interface TestDocs {
    importStatements: {
        value: string;
        path: string;
    }[];
    moduleSetup: any;
    includeTestForComponent: string;
    includesComponents?: string[];
    inlineClasses: InlineClass[];
    fileName: string;
    examples: TestExample[];
    inlineFunctions: string[];
    hasHostComponent: boolean;
    moduleMetadataOverride: {
        moduleRefName: string;
        entryComponents: string[];
    }[];
}
export interface TestExample {
    componentProperties: {
        name: string;
        expression: string;
    }[];
    httpRequests: {
        name: string;
        expression: string;
        url: string;
    }[];
    sourceCode: string;
    title: string;
    bootstrapComponent: string;
    selector: string;
}
export interface BinaryExpression {
    asString: string;
    expression: ts.BinaryExpression;
}
export declare class TestSourceParser {
    private config;
    private program;
    private checker;
    constructor(config: any, program: ts.Program);
    getProjectTestDocumentation(classesWithDocs: SourceDocs[], otherClasses: SourceDocs[]): TestDocs[];
    private verifyBootstrapComponentsIsAvailable;
    private getTestDocs;
    private getExampleComponentSourceDocs;
    private getExampleSourceCode;
    private getComponentSourceCode;
    private getComponentExpressionsFromTest;
    private convertBinaryExpressionToVariableDeclaration;
    private getExampleHttpRequests;
    private getTestSourceDetails;
    private getVariableDeclarationsDetails;
    private getOverrideModuleMetadata;
    private getInlineFunction;
    private getJsDocTags;
    private getHostComponentName;
    private getUIJarComponentName;
    private isExampleComment;
    private isOverrideModuleExpression;
    private getExampleTitle;
    private getExampleHostComponent;
    private getExampleComponentProperties;
    private getExampleFunctionCallsDetails;
    private getImportStatementDetails;
    private getModuleDefinitionDetails;
    private getInlineComponent;
    private getInlineClass;
}

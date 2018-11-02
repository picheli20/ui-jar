import * as ts from 'typescript';
import { TestDocs } from './test-source-parser';
export interface TestModuleSourceFile {
    sourceFile: ts.SourceFile;
    fileName: string;
}
export declare class TestModuleGenerator {
    private getTempModuleTemplate;
    private overrideRouterTestingModuleWithRouterModule;
    private getInlineClassSourceCode;
    private getModuleSetupTemplate;
    private getResolvedImportStatements;
    private getTemplateForExamplePropertiesFunction;
    private getModuleMetadataOverrideProperties;
    getTestModuleSourceFiles(testDocumentation: TestDocs[]): TestModuleSourceFile[];
    private isImportPathRelative;
}

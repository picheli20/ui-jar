import * as ts from 'typescript';
export interface GeneratedSourceParserConfig {
    files?: string[];
    testSourceFiles?: ts.SourceFile[];
}
export interface GeneratedModuleDocs {
    moduleRefName?: string;
    fileName?: string;
    includeTestForComponent?: string;
}
export declare class GeneratedSourceParser {
    private config;
    private program;
    private checker;
    constructor(config: GeneratedSourceParserConfig, tsOptions: ts.CompilerOptions);
    private getCompilerHost;
    getGeneratedDocumentation(): GeneratedModuleDocs[];
    private getModuleDocs;
    private getIncludedTestForComponent;
    private getSourceFileData;
}

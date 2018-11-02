import * as ts from 'typescript';
import { ProjectSourceDocs } from './component-parser';
export declare class SourceParser {
    private config;
    private program;
    private moduleParser;
    private componentParser;
    constructor(config: {
        rootDir: string;
        files: string[];
    }, program: ts.Program);
    getProjectSourceDocumentation(): ProjectSourceDocs;
    private getComponentAndModuleFiles;
    private isContainingClass;
    private isModuleFile;
}

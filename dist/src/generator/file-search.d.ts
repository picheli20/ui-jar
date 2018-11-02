import * as ts from 'typescript';
export declare class FileSearch {
    private includes;
    private excludes;
    constructor(includes?: any[], excludes?: any[]);
    getFiles(directory: string): string[];
    getTestFiles(files: string[], program: ts.Program): string[];
    private getTestSourceDetails;
    private containsUIJarAnnotation;
}

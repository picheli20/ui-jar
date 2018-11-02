import * as ts from 'typescript';
export interface ModuleDocs {
    moduleRefName?: string;
    fileName?: string;
    includesComponents?: string[];
}
export declare class ModuleParser {
    private program;
    constructor(program: ts.Program);
    getModuleDocs(moduleFiles: string[]): ModuleDocs[];
    private getAllComponentDeclarationsInModule;
    private getModuleSourceData;
}

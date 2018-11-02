import * as ts from 'typescript';
export declare class TestModuleTemplateWriter {
    static outputFilename: string;
    static outputDirectoryPath: string;
    createTestModuleFiles(sourceFiles: ts.SourceFile[]): void;
    private createOutputPathIfNotAlreadyExist;
}

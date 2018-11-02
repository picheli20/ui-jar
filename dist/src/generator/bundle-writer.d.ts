import { SourceDocs } from './component-parser';
export declare class BundleTemplateWriter {
    private documentation;
    private urlPrefix;
    private outputFilename;
    private outputDirectoryPath;
    constructor(documentation: SourceDocs[], urlPrefix: string);
    private getJavascriptFileTemplate;
    createBundleFile(): void;
    private updateImportPathsToMatchGeneratedTestModules;
    private createOutputPathIfNotAlreadyExist;
    private getModuleImportNames;
    private getModuleImportStatements;
    private getUniqueModules;
    private getComponentData;
    private getComponentExampleProperties;
    private getModuleMetadataOverrideProperties;
    private getComponentRefs;
    private getNavigationLinks;
}

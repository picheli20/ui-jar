import { OnInit, Compiler, ViewContainerRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodeExampleComponent } from './code-example/code-example.component';
import { AppData } from '../../app.model';
export declare class ExampleItemComponent implements OnInit {
    private compiler;
    private activatedRoute;
    private ngZone;
    private appData;
    content: ViewContainerRef;
    codeExampleComponent: CodeExampleComponent;
    private modules;
    _example: ExampleProperties;
    exampleSourceCode: string;
    isLoaded: boolean;
    example: any;
    constructor(compiler: Compiler, activatedRoute: ActivatedRoute, ngZone: NgZone, appData: AppData);
    ngOnInit(): void;
    private getCurrentComponentName;
    private getComponentModuleImports;
    private getBootstrapComponentRef;
    private createView;
    toggleViewSource(): void;
    private createComponent;
    private setExampleSourceCode;
    private getBootstrapModule;
    private cleanUp;
    private listenOnHttpRequests;
    private flushPendingRequest;
    private setComponentProperties;
    private setModuleMetadataOverridesOnImports;
}
export interface ExampleProperties {
    title: string;
    componentProperties: {
        name: string;
        expression: string;
    };
    httpRequests: any;
    sourceCode: string;
    bootstrapComponent: string;
    selector: string;
}
export interface ModuleMetadataOverrideProperties {
    moduleRefName: any;
    entryComponents: any[];
}

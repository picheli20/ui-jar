"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var router_1 = require("@angular/router");
var container_component_1 = require("./container/container.component");
var app_component_1 = require("./app.component");
var introduction_component_1 = require("./introduction/introduction.component");
var overview_component_1 = require("./overview/overview.component");
var api_component_1 = require("./api/api.component");
var examples_module_1 = require("./examples/examples.module");
var generatedOutput = require('../../../temp/__ui-jar-temp');
var modules = {
    imports: [
        platform_browser_1.BrowserModule,
        examples_module_1.ExamplesModule,
        router_1.RouterModule.forRoot([
            { path: '', component: introduction_component_1.IntroductionComponent },
            {
                path: ':component',
                component: container_component_1.ContainerComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'overview'
                    },
                    {
                        path: 'overview',
                        component: overview_component_1.OverviewComponent
                    },
                    {
                        path: 'api',
                        component: api_component_1.ApiComponent
                    }
                ]
            }
        ], { initialNavigation: false })
    ],
    declarations: [
        container_component_1.ContainerComponent,
        app_component_1.AppComponent,
        introduction_component_1.IntroductionComponent,
        overview_component_1.OverviewComponent,
        api_component_1.ApiComponent
    ],
    bootstrap: [
        app_component_1.AppComponent
    ],
    providers: [
        { provide: 'AppData', useFactory: generatedOutput.getAppData }
    ],
    entryComponents: [],
    schemas: []
};
exports.UIJarModule = function (config) {
    if (config === void 0) { config = { config: {} }; }
    if (!config.providers) {
        config.providers = [];
    }
    config.providers.push({ provide: 'AppConfig', useValue: config });
    ['providers', 'declarations', 'imports', 'entryComponents', 'bootstrap', 'schemas'].forEach(function (attr) {
        var _a;
        return config[attr] && modules[attr] ? (_a = modules[attr]).push.apply(_a, config[attr]) : null;
    });
    return core_1.NgModule(modules);
};

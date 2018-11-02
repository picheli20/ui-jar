"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var testing_1 = require("@angular/common/http/testing");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var code_example_component_1 = require("./code-example/code-example.component");
var ExampleItemComponent = (function () {
    function ExampleItemComponent(compiler, activatedRoute, ngZone, appData) {
        this.compiler = compiler;
        this.activatedRoute = activatedRoute;
        this.ngZone = ngZone;
        this.appData = appData;
        this.modules = [];
        this.exampleSourceCode = '';
        this.isLoaded = false;
    }
    Object.defineProperty(ExampleItemComponent.prototype, "example", {
        set: function (value) {
            this._example = value;
        },
        enumerable: true,
        configurable: true
    });
    ExampleItemComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.modules = this.appData.modules;
        setTimeout(function () {
            _this.createView();
            _this.isLoaded = true;
        }, 1);
    };
    ExampleItemComponent.prototype.getCurrentComponentName = function () {
        var lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length - 1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    };
    ExampleItemComponent.prototype.getComponentModuleImports = function (componentKey) {
        var _this = this;
        var dependencies = this.appData.components[decodeURI(componentKey)].moduleDependencies;
        var imports = [];
        dependencies.forEach(function (moduleName) {
            _this.modules.forEach(function (moduleDetails) {
                if (moduleName === moduleDetails.name) {
                    imports.push(moduleDetails.moduleRef);
                }
            });
        });
        return imports;
    };
    ExampleItemComponent.prototype.getBootstrapComponentRef = function () {
        var bootstrapComponent = this._example.bootstrapComponent;
        var componentDetails = this.appData.componentRefs.find(function (componentDetails) {
            return bootstrapComponent === componentDetails.name;
        });
        if (componentDetails) {
            return componentDetails.componentRef;
        }
    };
    ExampleItemComponent.prototype.createView = function () {
        this.codeExampleComponent.hide();
        this.createComponent();
    };
    ExampleItemComponent.prototype.toggleViewSource = function () {
        if (this.codeExampleComponent.isComponentVisible()) {
            this.codeExampleComponent.hide();
        }
        else {
            this.codeExampleComponent.show();
        }
    };
    ExampleItemComponent.prototype.createComponent = function () {
        var _this = this;
        this.cleanUp();
        var componentName = this.getCurrentComponentName();
        var bootstrapModule = this.getBootstrapModule(componentName);
        var bootstrapComponentRef = this.getBootstrapComponentRef();
        this.content.element.nativeElement.appendChild(document.createElement(this._example.selector));
        platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(bootstrapModule, { ngZone: this.ngZone }).then(function (ngModuleRef) {
            var componentRef = ngModuleRef.instance.bootstrapComponent(bootstrapComponentRef, _this.content.element.nativeElement.firstChild);
            _this.listenOnHttpRequests(componentRef.injector, _this._example.httpRequests);
            _this.setComponentProperties(componentRef, _this._example.componentProperties);
            _this.setExampleSourceCode(componentRef, _this._example.sourceCode);
        });
    };
    ExampleItemComponent.prototype.setExampleSourceCode = function (componentRef, sourceCode) {
        var modifiedSourceCodeSplit = sourceCode.split(/\)[\n\s\t\r]+class|\)[\n\s\t\r]+export\sclass/);
        if (modifiedSourceCodeSplit.length > 1) {
            var componentKeys = Object.keys(componentRef.instance).concat(Object.keys(Object.getPrototypeOf(componentRef.instance)));
            var uniqueComponentProperties = Array.from(new Set(componentKeys));
            var propertyNamesInExample = uniqueComponentProperties.filter(function (propertyName) {
                return new RegExp('="(?:[\\w\\s]+)?' + propertyName + '(?:\.|\\[)?(?:.+)?"|\{\{(?:\.|\\[["\'])?' + propertyName + '(?:\.|["\']\\])?(?:.+)?\}\}', 'i').test(modifiedSourceCodeSplit[0]);
            });
            try {
                var jsonValues_1 = [];
                var jsonReplacer_1 = function (key, value) {
                    if (value !== null && typeof value === 'object') {
                        if (jsonValues_1.includes(value)) {
                            return;
                        }
                        jsonValues_1.push(value);
                    }
                    return value;
                };
                var classProperties = propertyNamesInExample.reduce(function (result, currentKey) {
                    if (typeof componentRef.instance[currentKey] === 'function') {
                        result += ("  " + currentKey + componentRef.instance[currentKey] + ";\n").replace('function', '');
                    }
                    else {
                        result += "  " + currentKey + " = " + JSON.stringify(componentRef.instance[currentKey], jsonReplacer_1) + ";\n";
                    }
                    return result;
                }, '');
                classProperties = "{\n" + classProperties + "}";
                modifiedSourceCodeSplit[1] = modifiedSourceCodeSplit[1].slice(0, modifiedSourceCodeSplit[1].indexOf('{')) + classProperties;
            }
            catch (error) {
                console.error(error);
            }
        }
        this.exampleSourceCode = modifiedSourceCodeSplit.join(')\nclass');
    };
    ExampleItemComponent.prototype.getBootstrapModule = function (componentKey) {
        var importModule = this.getComponentModuleImports(componentKey)[0];
        var overridenImportModule = this.setModuleMetadataOverridesOnImports(importModule);
        return overridenImportModule;
    };
    ExampleItemComponent.prototype.cleanUp = function () {
        this.content.clear();
        this.compiler.clearCache();
    };
    ExampleItemComponent.prototype.listenOnHttpRequests = function (componentRefInjector, httpRequests) {
        var _this = this;
        if (httpRequests.length === 0) {
            return;
        }
        try {
            var httpTestingController_1 = componentRefInjector.get(testing_1.HttpTestingController);
            var httpBackend_1 = componentRefInjector.get(http_1.HttpBackend);
            var originalHandle_1 = httpBackend_1.handle;
            httpBackend_1.handle = function (currentRequest) {
                setTimeout(function () {
                    httpRequests.forEach(function (httpRequest) {
                        if (httpRequest.url === currentRequest.url) {
                            _this.flushPendingRequest(httpRequest, httpTestingController_1.match(currentRequest.url));
                        }
                    });
                }, 0);
                return originalHandle_1.call(httpBackend_1, currentRequest);
            };
        }
        catch (error) {
        }
    };
    ExampleItemComponent.prototype.flushPendingRequest = function (currentRequest, mockRequests) {
        if (mockRequests.length > 0) {
            var __uijar__testRequest = mockRequests.shift();
            var expr = currentRequest.expression.replace(currentRequest.name, '__uijar__testRequest');
            try {
                eval(expr);
            }
            catch (error) {
            }
        }
    };
    ExampleItemComponent.prototype.setComponentProperties = function (componentRef, componentProperties) {
        componentProperties.map(function (propItem) {
            return propItem.expression.replace(propItem.name, 'componentRef.instance');
        }).forEach(function (propertyExpression) {
            eval(propertyExpression);
        });
    };
    ExampleItemComponent.prototype.setModuleMetadataOverridesOnImports = function (ngModule) {
        var moduleDetail = this.appData.modules.find(function (moduleDetails) {
            return moduleDetails.moduleRef === ngModule;
        });
        var hasMetadataAnnotations = ngModule.__annotations__ && ngModule.__annotations__[0];
        if (moduleDetail && hasMetadataAnnotations) {
            var modulesMetadataOverride_1 = this.appData.moduleMetadataOverrides[moduleDetail.name];
            var importsInModule = ngModule.__annotations__[0].imports || [];
            importsInModule.forEach(function (importedNgModule) {
                modulesMetadataOverride_1.forEach(function (moduleMetadataOverride) {
                    if (importedNgModule === moduleMetadataOverride.moduleRefName) {
                        var hasMetadataAnnotations_1 = importedNgModule.__annotations__ && importedNgModule.__annotations__[0];
                        if (hasMetadataAnnotations_1) {
                            var metadata_1 = importedNgModule.__annotations__[0];
                            var supportedMetadataOverrides = ['entryComponents'];
                            supportedMetadataOverrides.forEach(function (metadataPropertyName) {
                                metadata_1[metadataPropertyName] = moduleMetadataOverride[metadataPropertyName];
                            });
                        }
                    }
                });
            });
        }
        return ngModule;
    };
    __decorate([
        core_1.ViewChild('example', { read: core_1.ViewContainerRef }),
        __metadata("design:type", core_1.ViewContainerRef)
    ], ExampleItemComponent.prototype, "content", void 0);
    __decorate([
        core_1.ViewChild(code_example_component_1.CodeExampleComponent),
        __metadata("design:type", code_example_component_1.CodeExampleComponent)
    ], ExampleItemComponent.prototype, "codeExampleComponent", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], ExampleItemComponent.prototype, "example", null);
    ExampleItemComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-example-item',
            template: "\n        <div class=\"example-top-bar\">\n            <h2>{{_example.title}}</h2>\n            <button class=\"view-source-btn\" (click)=\"toggleViewSource()\" title=\"View source\">\n                <svg width=\"23\" height=\"11\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <g>\n                        <path d=\"M 7.6115221,10.08469 1.9751419,5.5563165 7.6115221,0.8834201 2.0233161,5.5563165 z\" \n                            style=\"fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none\" />\n                        <path d=\"m 15.397052,10.08469 5.63638,-4.5283735 -5.63638,-4.6728964 5.588205,4.6728964 z\" \n                            style=\"fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none\" />\n                    </g>\n                </svg>\n            </button>\n        </div>\n        <ui-jar-code-example [sourceCode]=\"exampleSourceCode\"></ui-jar-code-example>\n        <div class=\"example-container\">\n            <div #example></div>\n            <p *ngIf=\"!isLoaded\" class=\"loading-text\">Loading...</p>\n        </div>\n    ",
            styles: ["\n        :host {\n            display: block;\n            box-shadow: 1px 1px 3px #4e4e4e;\n            margin-bottom: 10px;\n        }\n\n        .view-source-btn {\n            position: absolute;\n            z-index: 500;\n            top: 6px;\n            right: 0;\n            background: none;\n            border: 0;\n            outline: 0;\n            padding: 5px 10px;\n            cursor: pointer;\n        }\n\n        .view-source-btn:hover {\n            color: var(--accent-color);\n            cursor: pointer;\n        }\n\n        .view-source-btn svg {\n            vertical-align: text-top;\n        }\n\n        .example-container {\n            padding: 20px;\n        }\n\n        .example-container .loading-text {\n            text-align: center;\n        }\n\n        .example-top-bar {\n            position: relative;\n            background: var(--items-header-background);\n            height: 35px;\n            border-bottom: 1px #ddd solid;\n        }\n\n        .example-top-bar h2 {\n            float: left;\n            margin: 0 0 0 8px;\n            font-size: 14px;\n            font-weight: normal;\n            line-height: 35px;\n            color: var(--items-header-color);\n        }\n    "]
        }),
        __param(3, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [core_1.Compiler,
            router_1.ActivatedRoute,
            core_1.NgZone, Object])
    ], ExampleItemComponent);
    return ExampleItemComponent;
}());
exports.ExampleItemComponent = ExampleItemComponent;

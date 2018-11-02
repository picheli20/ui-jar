"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var crypto = require("crypto");
var test_module_writer_1 = require("./test-module-writer");
var TestModuleGenerator = (function () {
    function TestModuleGenerator() {
    }
    TestModuleGenerator.prototype.getTempModuleTemplate = function (component, moduleId) {
        var moduleName = "TempModule" + moduleId;
        var defaultImports = "import { NgModule, Component } from \"@angular/core\";import { BrowserModule } from \"@angular/platform-browser\";";
        component.moduleSetup.imports = component.moduleSetup.imports || [];
        component.moduleSetup.imports.push('BrowserModule');
        if (!component.moduleSetup.imports.includes('CommonModule')) {
            defaultImports += "import { CommonModule } from \"@angular/common\";";
            component.moduleSetup.imports.push('CommonModule');
        }
        if (component.moduleSetup.imports.find(function (importStatement) { return importStatement.includes('RouterTestingModule'); })) {
            component.moduleSetup.imports = this.overrideRouterTestingModuleWithRouterModule(component.moduleSetup.imports);
            defaultImports += "import { RouterModule } from \"@angular/router\";";
        }
        var moduleSetupTemplate = this.getModuleSetupTemplate(component);
        var template = "/**::ui-jar_source_module::" + component.includeTestForComponent + "*/" + defaultImports;
        template += this.getResolvedImportStatements(component);
        template += this.getInlineClassSourceCode(component.inlineClasses);
        template += "" + component.inlineFunctions;
        template += "@NgModule(" + moduleSetupTemplate + ") export class " + moduleName + " {\n            private appRef;\n            bootstrapComponent(value, bootstrapNode) {\n                return this.appRef.bootstrap(value, bootstrapNode);\n            }\n            \n            ngDoBootstrap(appRef) {\n                this.appRef = appRef;\n            }\n        }";
        template += this.getTemplateForExamplePropertiesFunction(component);
        template += this.getModuleMetadataOverrideProperties(component);
        var bootstrapComponents = component.examples.map(function (example) { return example.bootstrapComponent; });
        var uniqueBootstrapComponents = Array.from(new Set(bootstrapComponents));
        uniqueBootstrapComponents.forEach(function (bootstrapComponent) {
            template += "exports." + bootstrapComponent + " = " + bootstrapComponent + ";";
        });
        return template;
    };
    TestModuleGenerator.prototype.overrideRouterTestingModuleWithRouterModule = function (importModules) {
        var importModulesClone = importModules.slice();
        var routerTestingModuleIndex = importModulesClone.findIndex(function (importStatement) { return importStatement.includes('RouterTestingModule'); });
        importModulesClone.splice(routerTestingModuleIndex, 1, 'RouterModule.forRoot([{ path: "**", component: {} }])');
        return importModulesClone;
    };
    TestModuleGenerator.prototype.getInlineClassSourceCode = function (inlineClasses) {
        return inlineClasses.map(function (inlineClass) { return inlineClass.source; });
    };
    TestModuleGenerator.prototype.getModuleSetupTemplate = function (component) {
        var moduleSetupTemplate = Object.keys(component.moduleSetup).reduce(function (result, propertyName) {
            result += propertyName + ':[' + component.moduleSetup[propertyName] + '],';
            return result;
        }, '');
        var entryComponents = component.examples.filter(function (example) { return example.bootstrapComponent; }).map(function (example) { return example.bootstrapComponent; });
        moduleSetupTemplate = moduleSetupTemplate.concat("entryComponents:[" + entryComponents + "]");
        if (component.moduleSetup.declarations) {
            moduleSetupTemplate = moduleSetupTemplate.concat(",exports:[" + component.moduleSetup.declarations + "]");
        }
        moduleSetupTemplate = "{" + moduleSetupTemplate + "}";
        return moduleSetupTemplate;
    };
    TestModuleGenerator.prototype.getResolvedImportStatements = function (component) {
        var _this = this;
        var importsTemplate = '';
        component.importStatements.forEach(function (importStatement) {
            if (_this.isImportPathRelative(importStatement)) {
                var importStatementPath = importStatement.path.replace(/[\"']/gi, '');
                var sourceFileDirectoryPath = path.resolve(component.fileName.substr(0, component.fileName.lastIndexOf('/')));
                var testFilePath = path.relative(path.resolve(test_module_writer_1.TestModuleTemplateWriter.outputDirectoryPath), sourceFileDirectoryPath);
                var sourceFileAbsolutePath = path.resolve(path.resolve(test_module_writer_1.TestModuleTemplateWriter.outputDirectoryPath), testFilePath, importStatementPath);
                var importPath = path.relative(path.resolve(test_module_writer_1.TestModuleTemplateWriter.outputDirectoryPath), sourceFileAbsolutePath);
                var replacedImportStatement = importStatement.value.replace(importStatement.path, "'" + importPath + "'")
                    .replace(/\\/gi, '/');
                importsTemplate += replacedImportStatement;
            }
            else {
                importsTemplate += importStatement.value;
            }
        });
        return importsTemplate;
    };
    TestModuleGenerator.prototype.getTemplateForExamplePropertiesFunction = function (component) {
        var exampleProperties = '[';
        component.examples.forEach(function (example, index) {
            exampleProperties += '{ properties: {';
            var componentPropertyName = '';
            example.componentProperties.forEach(function (prop) {
                componentPropertyName = prop.name;
                var firstIndexOfEquals = prop.expression.indexOf('=');
                var propertyName = prop.expression.substr(0, firstIndexOfEquals);
                propertyName = '"' + propertyName.replace(/\s+/gi, '').replace(/"/gi, '\'') + '"';
                var expression = prop.expression.substr(firstIndexOfEquals + 1);
                var objectSyntax = propertyName + ':' + expression;
                exampleProperties += objectSyntax + ", ";
            });
            var exampleHttpRequests = '{';
            example.httpRequests.forEach(function (httpRequest) {
                var propertyName = '"' + httpRequest.name.replace(/\s+/gi, '').replace(/"/gi, '\'') + '"';
                exampleHttpRequests += propertyName + ': { expression: "' + httpRequest.expression.replace(/"/gi, '\'') + '", url: "' + httpRequest.url + '" }';
                exampleHttpRequests += ', ';
            });
            exampleHttpRequests += '}';
            exampleProperties += "}, componentPropertyName: \"" + componentPropertyName + "\"";
            exampleProperties += ", httpRequests: " + exampleHttpRequests;
            exampleProperties += ", sourceCode: " + JSON.stringify(example.sourceCode);
            exampleProperties += ", title: \"" + example.title + "\"";
            exampleProperties += ", bootstrapComponent: \"" + example.bootstrapComponent + "\"";
            exampleProperties += ", selector: \"" + example.selector + "\"";
            exampleProperties += '}' + (index < component.examples.length - 1 ? ',' : '');
        });
        exampleProperties += ']';
        exampleProperties = "export function getComponentExampleProperties () { \n            let examples = " + exampleProperties + ";\n            let modifiedExamples = [];\n\n            return examples.map((example) => {\n                let componentProperties = example.properties;\n                let result = {};\n                result.componentProperties = Object.keys(componentProperties).map((propertyKey) => {\n                    \n                    let expressionValue = JSON.stringify(componentProperties[propertyKey]);\n                    expressionValue = propertyKey +'='+ expressionValue;\n                    \n                    return {\n                        name: example.componentPropertyName,\n                        expression: expressionValue\n                    }; \n                });\n\n                result.httpRequests = Object.keys(example.httpRequests).map((propertyKey) => {\n                    return {\n                        name: propertyKey,\n                        url: example.httpRequests[propertyKey].url,\n                        expression: example.httpRequests[propertyKey].expression\n                    }\n                });\n\n                result.sourceCode = example.sourceCode;\n                result.title = example.title;\n                result.bootstrapComponent = example.bootstrapComponent;\n                result.selector = example.selector;\n\n                return result;\n            });\n        }";
        return exampleProperties;
    };
    TestModuleGenerator.prototype.getModuleMetadataOverrideProperties = function (component) {
        var properties = component.moduleMetadataOverride.reduce(function (result, metadataOverride) {
            result += "{\n                moduleRefName: " + metadataOverride.moduleRefName + ",\n                entryComponents: [" + metadataOverride.entryComponents + "]\n            },";
            return result;
        }, '');
        properties = "[" + properties + "]";
        var template = "export function getModuleMetadataOverrideProperties () {\n            return " + properties + ";\n        }";
        return template;
    };
    TestModuleGenerator.prototype.getTestModuleSourceFiles = function (testDocumentation) {
        var _this = this;
        var sourceFiles = [];
        testDocumentation.forEach(function (component, index) {
            if (component.examples.length > 0) {
                var sourceFileNameHash = crypto.createHash('md5').update(component.fileName).digest('hex');
                var sourceFile = ts.createSourceFile(test_module_writer_1.TestModuleTemplateWriter.outputFilename + '-' + sourceFileNameHash + '.ts', _this.getTempModuleTemplate(component, sourceFileNameHash), ts.ScriptTarget.ES5);
                sourceFiles.push({
                    sourceFile: sourceFile,
                    fileName: component.fileName
                });
            }
        });
        return sourceFiles;
    };
    TestModuleGenerator.prototype.isImportPathRelative = function (importStatement) {
        return importStatement.path.charAt(1) === '.';
    };
    return TestModuleGenerator;
}());
exports.TestModuleGenerator = TestModuleGenerator;

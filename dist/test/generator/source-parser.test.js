"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var ts = require("typescript");
var source_parser_1 = require("../../src/generator/source-parser");
describe('SourceParser', function () {
    describe('getProjectSourceDocumentation', function () {
        var classesWithDocs;
        var otherClasses;
        beforeEach(function () {
            var sourceFiles = [
                'foobar.component.ts',
                'foobar.module.ts',
                'foobar.component.test.ts',
                'child.component.ts',
                'parent.component.ts',
                'child-generic.component.ts',
                'parent-generic.component.ts'
            ];
            var compilerHost = getTestCompilerHostWithMockModuleAndComponent();
            var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);
            var sourceParser = new source_parser_1.SourceParser({ rootDir: './', files: sourceFiles }, program);
            var projectDocumentation = sourceParser.getProjectSourceDocumentation();
            classesWithDocs = projectDocumentation.classesWithDocs;
            otherClasses = projectDocumentation.otherClasses;
        });
        it('should parse files and return list with SourceDocs', function () {
            assert.equal(classesWithDocs.length, 3);
        });
        it('should parse and verify that SourceDocs.componentRefName is valid', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.componentRefName, 'FoobarComponent');
        });
        it('should parse and verify that SourceDocs.componentDocName is set', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.componentDocName, 'Foobar');
        });
        it('should parse and verify that SourceDocs.groupDocName is set', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.groupDocName, 'Layout');
        });
        it('should parse and verify that SourceDocs.description is set', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.description, 'It\'s possible to use <strong>html</strong> in \nthe description');
        });
        it('should parse and verify that SourceDocs.fileName is valid', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.fileName, 'foobar.component.ts');
        });
        it('should parse and verify that SourceDocs.moduleDetails is valid', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.moduleDetails.moduleRefName, 'FoobarModule');
            assert.equal(firstSourceDoc.moduleDetails.fileName, 'foobar.module.ts');
        });
        it('should parse and verify that SourceDocs.selector is valid', function () {
            var firstSourceDoc = classesWithDocs[0];
            assert.equal(firstSourceDoc.selector, 'x-foobar');
        });
        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties', function () {
            var firstSourceDoc = classesWithDocs[0];
            firstSourceDoc.apiDetails.properties.forEach(function (property, index) {
                if (index === 0) {
                    assert.equal(property.propertyName, 'title');
                    assert.equal(property.type, 'string');
                }
                else if (index === 1) {
                    assert.equal(property.propertyName, 'options');
                    property.decoratorNames.forEach(function (decoratorName) {
                        assert.equal(decoratorName, '@Input()');
                    });
                }
                else if (index === 2) {
                    assert.equal(property.propertyName, 'changed');
                    property.decoratorNames.forEach(function (decoratorName) {
                        assert.equal(decoratorName, '@Output()');
                    });
                }
                else if (index === 3) {
                    assert.equal(property.propertyName, 'isSmall');
                    property.decoratorNames.forEach(function (decoratorName, decoratorIndex) {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        }
                        else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                }
                else if (index === 4) {
                    assert.equal(property.propertyName, 'propertyWithDescription');
                    assert.equal(property.type, 'number');
                    assert.equal(property.description, 'Description to property should be parsed');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods', function () {
            var firstSourceDoc = classesWithDocs[0];
            firstSourceDoc.apiDetails.methods.forEach(function (method, index) {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicMethod()');
                    assert.equal(method.description, '');
                }
                else if (index === 1) {
                    assert.equal(method.methodName, 'methodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, '');
                }
                else if (index === 2) {
                    assert.equal(method.methodName, 'publicMethodWithDescription()');
                    assert.equal(method.description, 'Description to method should be parsed');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that SourceDocs.extendClasses is valid', function () {
            var foobarComponentSourceDoc = classesWithDocs[0];
            var childComponentSourceDoc = classesWithDocs[1];
            var childGenericSourceDoc = classesWithDocs[2];
            var parentComponentSourceDoc = otherClasses[2];
            var parentGenericComponentSourceDoc = otherClasses[3];
            assert.equal(foobarComponentSourceDoc.extendClasses.length, 0, 'Should not have any extended classes');
            assert.equal(childComponentSourceDoc.extendClasses.length, 1, 'Should have one extended class');
            assert.equal(childGenericSourceDoc.extendClasses.length, 1, 'Should have one extended class');
            assert.equal(childComponentSourceDoc.extendClasses[0], 'ParentComponent');
            assert.equal(childGenericSourceDoc.extendClasses[0], 'ParentGenericComponent');
            assert.equal(parentComponentSourceDoc.componentRefName, 'ParentComponent');
            assert.equal(parentComponentSourceDoc.extendClasses.length, 1, 'Should have one extended class');
            assert.equal(parentComponentSourceDoc.extendClasses[0], 'BaseComponent');
            assert.equal(parentGenericComponentSourceDoc.componentRefName, 'ParentGenericComponent');
            assert.equal(parentGenericComponentSourceDoc.extendClasses.length, 0, 'Should not have any extended classes');
        });
        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties from extended component', function () {
            var secondSourceDoc = classesWithDocs[1];
            assert.equal(secondSourceDoc.apiDetails.properties.length, 5, 'Should contain public properties from both child and parent component');
            secondSourceDoc.apiDetails.properties.forEach(function (property, index) {
                if (index === 0) {
                    assert.equal(property.propertyName, 'childTitle');
                    assert.equal(property.type, 'string');
                }
                else if (index === 1) {
                    assert.equal(property.propertyName, 'childOptions');
                    property.decoratorNames.forEach(function (decoratorName) {
                        assert.equal(decoratorName, '@Input()');
                    });
                }
                else if (index === 2) {
                    assert.equal(property.propertyName, 'childIsSmall');
                    property.decoratorNames.forEach(function (decoratorName, decoratorIndex) {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        }
                        else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                }
                else if (index === 3) {
                    assert.equal(property.propertyName, 'parentTitle');
                    assert.equal(property.type, 'string');
                    assert.equal(property.description, 'Parent property description');
                }
                else if (index === 4) {
                    assert.equal(property.propertyName, 'baseId');
                    assert.equal(property.type, 'number');
                    assert.equal(property.description, 'Base id description');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods from extended component', function () {
            var secondSourceDoc = classesWithDocs[1];
            assert.equal(secondSourceDoc.apiDetails.methods.length, 5, 'Should contain public methods from both child and parent component');
            secondSourceDoc.apiDetails.methods.forEach(function (method, index) {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicChildMethod()');
                    assert.equal(method.description, '');
                }
                else if (index === 1) {
                    assert.equal(method.methodName, 'childMethodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, 'Description to method should be parsed');
                }
                else if (index === 2) {
                    assert.equal(method.methodName, 'publicParentMethod()');
                    assert.equal(method.description, '');
                }
                else if (index === 3) {
                    assert.equal(method.methodName, 'publicParentMethodWithDescription()');
                    assert.equal(method.description, 'Parent method description');
                }
                else if (index === 4) {
                    assert.equal(method.methodName, 'publicBaseMethod()');
                    assert.equal(method.description, '');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that SourceDocs.apiDetails.properties contains public component properties from extended component<T>', function () {
            var thirdSourceDoc = classesWithDocs[2];
            assert.equal(thirdSourceDoc.apiDetails.properties.length, 5, 'Should contain public properties from both child and parent component');
            thirdSourceDoc.apiDetails.properties.forEach(function (property, index) {
                if (index === 0) {
                    assert.equal(property.propertyName, 'childTitle');
                    assert.equal(property.type, 'string');
                }
                else if (index === 1) {
                    assert.equal(property.propertyName, 'childOptions');
                    property.decoratorNames.forEach(function (decoratorName) {
                        assert.equal(decoratorName, '@Input()');
                    });
                }
                else if (index === 2) {
                    assert.equal(property.propertyName, 'childIsSmall');
                    property.decoratorNames.forEach(function (decoratorName, decoratorIndex) {
                        if (decoratorIndex === 0) {
                            assert.equal(decoratorName, '@HostBinding(\'class.small\')');
                        }
                        else if (decoratorIndex === 1) {
                            assert.equal(decoratorName, '@Input()');
                        }
                    });
                }
                else if (index === 3) {
                    assert.equal(property.propertyName, 'parentTitle');
                    assert.equal(property.type, 'string');
                    assert.equal(property.description, 'Parent property description');
                }
                else if (index === 4) {
                    assert.equal(property.propertyName, 'parentType');
                    assert.equal(property.type, 'T');
                    assert.equal(property.description, '');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that SourceDocs.apiDetails.methods contains public component methods from extended component<T>', function () {
            var thirdSourceDoc = classesWithDocs[2];
            assert.equal(thirdSourceDoc.apiDetails.methods.length, 4, 'Should contain public methods from both child and parent component');
            thirdSourceDoc.apiDetails.methods.forEach(function (method, index) {
                if (index === 0) {
                    assert.equal(method.methodName, 'publicChildMethod()');
                    assert.equal(method.description, '');
                }
                else if (index === 1) {
                    assert.equal(method.methodName, 'childMethodWithPublicModifierShouldBeVisibleInParse()');
                    assert.equal(method.description, 'Description to method should be parsed');
                }
                else if (index === 2) {
                    assert.equal(method.methodName, 'publicParentMethod()');
                    assert.equal(method.description, '');
                }
                else if (index === 3) {
                    assert.equal(method.methodName, 'publicParentMethodWithDescription()');
                    assert.equal(method.description, 'Parent method description');
                }
                else if (index === 4) {
                    assert.equal(method.methodName, 'publicBaseMethod()');
                    assert.equal(method.description, '');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
    });
});
function getTestCompilerHostWithMockModuleAndComponent() {
    var sourceFileContent = "\n        import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';\n\n        interface ParentInterface {\n            title: string;\n        }\n        \n        interface ChildInterface extends ParentInterface {\n            subTitle: string;\n        }\n\n        /**\n         * @group Layout\n         * @component Foobar\n         * @description \n         * It's possible to use <strong>html</strong> in \n         * the description\n         */\n        @Component({\n            selector: 'x-foobar',\n            template: 'test'\n        })\n        export class FoobarComponent {\n            title: string;\n            @Input() options: string[];\n            @Output()\n            changed: EventEmitter<boolean> = new EventEmitter();\n\n            @HostBinding('class.small')\n            @Input()\n            isSmall: boolean = false;\n\n            /**\n             * Description to property should be parsed\n             */\n            propertyWithDescription: number;\n\n            private privatePropertyShouldNotBeVisibleInParse: boolean = true;\n            protected protectedPropertyShouldNotBeVisibleInParse: boolean = true;\n\n            publicMethod(): number {\n                return 1;\n            }\n\n            private privateMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n\n            protected protectedMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n\n            public methodWithPublicModifierShouldBeVisibleInParse() {\n                return true;\n            }\n\n            /**\n             * Description to method should be parsed\n             */\n            publicMethodWithDescription() {\n                return 1;\n            }\n        }\n    ";
    var childComponentSourceFileContent = "\n        import { Component, Input, HostBinding } from '@angular/core';\n\n        /**\n         * @group Layout\n         * @component ChildComponent\n         */\n        @Component({\n            selector: 'x-child',\n            template: 'test'\n        })\n        export class ChildComponent extends ParentComponent {\n            childTitle: string;\n            @Input() childOptions: string[];\n\n            @HostBinding('class.small')\n            @Input()\n            childIsSmall: boolean = false;\n\n            publicChildMethod(): number {\n                return 1;\n            }\n\n            /**\n             * Description to method should be parsed\n             */\n            public childMethodWithPublicModifierShouldBeVisibleInParse() {\n                return true;\n            }\n\n            private childMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n        }\n    ";
    var parentComponentSourceFileContent = "\n        import { Component } from '@angular/core';\n\n        export abstract class BaseComponent {\n            /**\n             * Base id description\n             */\n            baseId: number;\n\n            publicBaseMethod() {\n                return true;\n            }\n\n            private baseMethodShouldNotBeVisibleInParse() {\n                return false;\n            }\n        }\n\n        export class ParentComponent extends BaseComponent {\n            /**\n             * Parent property description\n             */\n            parentTitle: string;\n\n            publicParentMethod(): number {\n                return 1;\n            }\n\n            /**\n             * Parent method description\n             */\n            publicParentMethodWithDescription(): number {\n                return 1;\n            }\n\n            private parentMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n        }\n    ";
    var childGenericComponentSourceFileContent = "\n        import { Component, Input, HostBinding } from '@angular/core';\n\n        /**\n         * @group Layout\n         * @component ChildGenericComponent\n         */\n        @Component({\n            selector: 'x-child-generic',\n            template: 'test'\n        })\n        export class ChildGenericComponent extends ParentGenericComponent<string> {\n            childTitle: string;\n            @Input() childOptions: string[];\n\n            @HostBinding('class.small')\n            @Input()\n            childIsSmall: boolean = false;\n\n            publicChildMethod(): number {\n                return 1;\n            }\n\n            /**\n             * Description to method should be parsed\n             */\n            public childMethodWithPublicModifierShouldBeVisibleInParse() {\n                return true;\n            }\n\n            private childMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n        }\n    ";
    var parentGenericComponentSourceFileContent = "\n        import { Component } from '@angular/core';\n\n        export class ParentGenericComponent<T> {\n            /**\n             * Parent property description\n             */\n            parentTitle: string;\n            parentType: T;\n\n            publicParentMethod(): number {\n                return 1;\n            }\n\n            /**\n             * Parent method description\n             */\n            publicParentMethodWithDescription(): number {\n                return 1;\n            }\n\n            private parentMethodShouldNotBeVisibleInParse() {\n                return true;\n            }\n        }\n    ";
    var sourceFileModuleContent = "\n        import { NgModule } from '@angular/core';\n        import { CommonModule } from '@angular/common';\n\n        @NgModule({\n            imports: [CommonModule],\n            declarations: [FoobarComponent],\n            exports: [FoobarComponent]\n        })\n        export class FoobarModule {\n            // ...\n        }\n    ";
    var testSourceFileContent = "const foobar = true;";
    var compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    compilerHost.getSourceFile = function (fileName, languageVersion, onError) {
        if (fileName.indexOf('.test.ts') > -1) {
            return ts.createSourceFile(fileName, testSourceFileContent, ts.ScriptTarget.ES5);
        }
        else if (fileName.indexOf('.module.ts') > -1) {
            return ts.createSourceFile(fileName, sourceFileModuleContent, ts.ScriptTarget.ES5);
        }
        else if (fileName.indexOf('child.component.ts') > -1) {
            return ts.createSourceFile(fileName, childComponentSourceFileContent, ts.ScriptTarget.ES5);
        }
        else if (fileName.indexOf('parent.component.ts') > -1) {
            return ts.createSourceFile(fileName, parentComponentSourceFileContent, ts.ScriptTarget.ES5);
        }
        else if (fileName.indexOf('child-generic.component.ts') > -1) {
            return ts.createSourceFile(fileName, childGenericComponentSourceFileContent, ts.ScriptTarget.ES5);
        }
        else if (fileName.indexOf('parent-generic.component.ts') > -1) {
            return ts.createSourceFile(fileName, parentGenericComponentSourceFileContent, ts.ScriptTarget.ES5);
        }
        return ts.createSourceFile(fileName, sourceFileContent, ts.ScriptTarget.ES5);
    };
    return compilerHost;
}

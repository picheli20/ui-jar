"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var ts = require("typescript");
var sinon = require("sinon");
var fs = require("fs");
var test_module_generator_1 = require("../../src/generator/test-module-generator");
var source_parser_1 = require("../../src/generator/source-parser");
var test_source_parser_1 = require("../../src/generator/test-source-parser");
describe('TestModuleGenerator', function () {
    describe('getTestModuleSourceFiles', function () {
        var testModuleSourceFile;
        var readFileSyncStub;
        beforeEach(function () {
            readFileSyncStub = sinon.stub(fs, 'readFileSync');
            readFileSyncStub.returns('<p>inline-test-with-external-template-using-template-url</p>');
            var sourceFiles = ['foobar.component.ts', 'foobar.component.test.ts'];
            var compilerHost = getTestCompilerHostWithMockComponent();
            var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);
            var sourceParser = new source_parser_1.SourceParser({ rootDir: './', files: sourceFiles }, program);
            var _a = sourceParser.getProjectSourceDocumentation(), classesWithDocs = _a.classesWithDocs, otherClasses = _a.otherClasses;
            var testSourceParser = new test_source_parser_1.TestSourceParser({ files: sourceFiles }, program);
            var testDocs = testSourceParser.getProjectTestDocumentation(classesWithDocs, otherClasses);
            var testModuleSourceFiles = new test_module_generator_1.TestModuleGenerator().getTestModuleSourceFiles(testDocs);
            testModuleSourceFile = testModuleSourceFiles[0].sourceFile.getText();
        });
        after(function () {
            readFileSyncStub.restore();
        });
        it('should return generated test source module - including all components and example properties', function () {
            assert.equal(testModuleSourceFile, "import { NgModule, Component } from \"@angular/core\";import { BrowserModule } from \"@angular/platform-browser\";import { Component } from '@angular/core';import { async, ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';import { FoobarComponent } from '../foobar.component.ts';import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing.ts';@Component({\n          selector: 'x-inline-test',\n          template: '<p>inline-test</p>'\n      })\n      export class InlineTestComponent {\n          // ...\n      },@Component({\n          selector: 'x-inline-test-with-template-url',\n          template: `\n<p>inline-test-with-external-template-using-template-url</p>\n`\n      })\n      export class InlineTestWithTemplateUrlComponent {\n          // ...\n      }function getOptions() {\n                return [\"item-1\", \"item-2\", \"item-3\"];\n            },function getTitle() {\n                return \"Test title\";\n            },function functionThatIsNotUsedInTestShouldAlsoBeIncluded() {\n            return null;\n        }@NgModule({imports:[CommonModule,HttpClientTestingModule,BrowserModule],declarations:[FoobarComponent],providers:[{ provide: CustomService, useValue: { foo: true, bar: [{ a: 1}, 2, 'foo bar']}, _bar: true, 'foo-bar': false, $foo: \"foo\", fooFn: (foo) => { /** jsdoc should be ok */ return foo += 123; }, query: '?foobar=true!#hashbang' },AnotherService],entryComponents:[FoobarComponent,FoobarComponent,FoobarComponent,FoobarComponent,FoobarComponent],exports:[FoobarComponent]}) export class TempModule8b329cf5499a0006dd4ce48ad34ec7f4 {\n            private appRef;\n            bootstrapComponent(value, bootstrapNode) {\n                return this.appRef.bootstrap(value, bootstrapNode);\n            }\n            \n            ngDoBootstrap(appRef) {\n                this.appRef = appRef;\n            }\n        }export function getComponentExampleProperties () { \n            let examples = [{ properties: {\"component.title\": \"Test title\", \"component.options\": [\"item-1\", \"item-2\", \"item-3\"], }, componentPropertyName: \"component\", httpRequests: {}, sourceCode: \"@Component({\\n  selector: 'example-host',\\n  template: `<x-foobar [options]=\\\"options\\\"></x-foobar>`\\n})\\nclass ExampleHostComponent {}\", title: \"Custom title for example\", bootstrapComponent: \"FoobarComponent\", selector: \"x-foobar\"},{ properties: {\"component.title\": 'Test title 2', \"component.options\": ['item-1', 'item-2'], \"component.disabled\": true, }, componentPropertyName: \"component\", httpRequests: {}, sourceCode: \"@Component({\\n  selector: 'example-host',\\n  template: `<x-foobar [options]=\\\"options\\\" [disabled]=\\\"disabled\\\"></x-foobar>`\\n})\\nclass ExampleHostComponent {}\", title: \"\", bootstrapComponent: \"FoobarComponent\", selector: \"x-foobar\"},{ properties: {\"component.title\": getTitle(), \"component.options\": getOptions(), }, componentPropertyName: \"component\", httpRequests: {}, sourceCode: \"@Component({\\n  selector: 'example-host',\\n  template: `<x-foobar [options]=\\\"options\\\"></x-foobar>`\\n})\\nclass ExampleHostComponent {}\", title: \"Title-with-dashes_and_\"other\" _'01234$#%'56,()=789 special chars\", bootstrapComponent: \"FoobarComponent\", selector: \"x-foobar\"},{ properties: {\"component.title\": \"Test with http request\", \"component.options\": [\"item-1\", \"item-2\", \"item-3\"], }, componentPropertyName: \"component\", httpRequests: {\"request\": { expression: \"request.flush('Should return this text')\", url: \"/foobar\" }, }, sourceCode: \"@Component({\\n  selector: 'example-host',\\n  template: `<x-foobar [options]=\\\"options\\\"></x-foobar>`\\n})\\nclass ExampleHostComponent {}\", title: \"Another custom title\", bootstrapComponent: \"FoobarComponent\", selector: \"x-foobar\"},{ properties: {\"component.title\": \"Test with http request error\", \"component.options\": [\"item-1\", \"item-2\", \"item-3\"], }, componentPropertyName: \"component\", httpRequests: {\"request\": { expression: \"request.error(new ErrorEvent('Server error', { error: new Error('503'), message: 'Server error' }))\", url: \"/error-url\" }, }, sourceCode: \"@Component({\\n  selector: 'example-host',\\n  template: `<x-foobar [options]=\\\"options\\\"></x-foobar>`\\n})\\nclass ExampleHostComponent {}\", title: \"Title with number  1234\", bootstrapComponent: \"FoobarComponent\", selector: \"x-foobar\"}];\n            let modifiedExamples = [];\n\n            return examples.map((example) => {\n                let componentProperties = example.properties;\n                let result = {};\n                result.componentProperties = Object.keys(componentProperties).map((propertyKey) => {\n                    \n                    let expressionValue = JSON.stringify(componentProperties[propertyKey]);\n                    expressionValue = propertyKey +'='+ expressionValue;\n                    \n                    return {\n                        name: example.componentPropertyName,\n                        expression: expressionValue\n                    }; \n                });\n\n                result.httpRequests = Object.keys(example.httpRequests).map((propertyKey) => {\n                    return {\n                        name: propertyKey,\n                        url: example.httpRequests[propertyKey].url,\n                        expression: example.httpRequests[propertyKey].expression\n                    }\n                });\n\n                result.sourceCode = example.sourceCode;\n                result.title = example.title;\n                result.bootstrapComponent = example.bootstrapComponent;\n                result.selector = example.selector;\n\n                return result;\n            });\n        }export function getModuleMetadataOverrideProperties () {\n            return [{\n                moduleRefName: SomeModuleToOverrideMetadataIn,\n                entryComponents: [CustomOverridenEntryComponent]\n            },];\n        }exports.FoobarComponent = FoobarComponent;");
        });
    });
});
function getTestCompilerHostWithMockComponent() {
    var testSourceFileContent = "\n    import { Component } from '@angular/core';\n    import { async, ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';\n    import { FoobarComponent } from './foobar.component.ts';\n    import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing.ts';\n\n    interface TestRequest {}\n\n    describe('FoobarComponent', () => {\n        let component: FoobarComponent;\n        let fixture: ComponentFixture<FoobarComponent>;\n        let httpMock: HttpTestingController;\n      \n        beforeEach(async(() => {\n          /** \n           * @uijar  FoobarComponent  \n           */\n          let moduleDef: TestModuleMetadata = {\n              imports: [CommonModule, HttpClientTestingModule],\n              declarations: [FoobarComponent],\n              providers: [{ provide: CustomService, useValue: { foo: true, bar: [{ a: 1}, 2, 'foo bar']}, _bar: true, 'foo-bar': false, $foo: \"foo\", fooFn: (foo) => { /** jsdoc should be ok */ return foo += 123; }, query: '?foobar=true!#hashbang' }, AnotherService]\n            };\n\n          TestBed.overrideModule(SomeModuleToOverrideMetadataIn, {\n            set: {\n              entryComponents: [ CustomOverridenEntryComponent ]\n            }\n          };\n\n          TestBed.configureTestingModule(moduleDef).compileComponents();\n        }));\n      \n        beforeEach(() => {\n          fixture = TestBed.createComponent(FoobarComponent);\n          component = fixture.componentInstance;\n          fixture.detectChanges();\n        });\n        \n        // @uijarexample Custom title for example\n        it('should parse test correct when using double quotes to set property value', () => {\n            component.title = \"Test title\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n\n            // ...\n        });\n\n        /** @uijarexample */\n        it('should parse test correct when using single quotes to set property value', () => {\n            component.title = 'Test title 2';\n            component.options = ['item-1', 'item-2'];\n            component.disabled = true;\n\n            // ...\n        });\n\n        /** \n         * @uijarexample Title-with-dashes_and_\"other\" _'01234$#%'56,()=789 special chars            */\n        it('should parse test correct when using inline function to set property value', () => {\n            function getOptions() {\n                return [\"item-1\", \"item-2\", \"item-3\"];\n            }\n\n            function getTitle() {\n                return \"Test title\";\n            }\n\n            component.title = getTitle();\n            component.options = getOptions();\n\n            // ...\n        });\n\n        function functionThatIsNotUsedInTestShouldAlsoBeIncluded() {\n            return null;\n        }\n\n        it('should ignore tests without /** @uijarexample */ annotation', () => {\n            component.title = \"Title should not be visible in parse\";\n        });\n\n        /** \n            * @uijarexample Another custom title \n         * \n        */\n        it('should parse http request in test (flush)', () => {\n            component.title = \"Test with http request\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n            const request: TestRequest = httpMock.expectOne('/foobar');\n            request.flush('Should return this text');\n\n            // ...\n        });\n\n        /** \n         * @uijarexample  Title with number  1234     \n         * **/\n        it('should parse http request in test (error)', () => {\n            component.title = \"Test with http request error\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n            const request: TestRequest = httpMock.expectOne('/error-url');\n            request.error(new ErrorEvent('Server error', { error: new Error('503'), message: 'Server error' }));\n\n            // ...\n        });\n      });\n\n      @Component({\n          selector: 'x-inline-test',\n          template: '<p>inline-test</p>'\n      })\n      export class InlineTestComponent {\n          // ...\n      }\n\n      @Component({\n          selector: 'x-inline-test-with-template-url',\n          templateUrl: './inline-test-with-template-url.html'\n      })\n      export class InlineTestWithTemplateUrlComponent {\n          // ...\n      }\n    ";
    var sourceFileContent = "\n        import { Component, Input } from '@angular/core';\n\n        /**\n         * @group Layout\n         * @component Foobar\n         */\n        @Component({\n            selector: 'x-foobar',\n            template: 'test'\n        })\n        export class FoobarComponent {\n            title: string;\n            @Input()\n            options: string[];\n            @Input()\n            disabled: boolean;\n        }\n    ";
    var compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    compilerHost.getSourceFile = function (fileName, languageVersion, onError) {
        if (fileName.indexOf('.test.ts') > -1) {
            return ts.createSourceFile(fileName, testSourceFileContent, ts.ScriptTarget.ES5);
        }
        return ts.createSourceFile(fileName, sourceFileContent, ts.ScriptTarget.ES5);
    };
    compilerHost.fileExists = function (fileName) {
        if (fileName.indexOf('.component.ts') > -1) {
            return true;
        }
    };
    return compilerHost;
}

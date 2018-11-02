"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var ts = require("typescript");
var sinon = require("sinon");
var fs = require("fs");
var test_source_parser_1 = require("../../src/generator/test-source-parser");
var source_parser_1 = require("../../src/generator/source-parser");
describe('TestSourceParser', function () {
    var readFileSyncStub;
    before(function () {
        readFileSyncStub = sinon.stub(fs, 'readFileSync');
        readFileSyncStub.withArgs(sinon.match(/inline\-test\-with\-template\-url\.html$/i)).returns('<p>inline-test-with-external-template-using-template-url</p>');
        readFileSyncStub.withArgs(sinon.match(/inline\-test\-with\-style\-urls\-1\.css$/i)).returns(':host { background-color: #000; }');
        readFileSyncStub.withArgs(sinon.match(/inline\-test\-with\-style\-urls\-2\.css$/i)).returns('.foobar { color: #fff; }');
    });
    after(function () {
        readFileSyncStub.restore();
    });
    describe('getProjectTestDocumentation', function () {
        var testDocs;
        beforeEach(function () {
            var sourceFiles = ['foobar.component.ts', 'foobar.component.test.ts'];
            var compilerHost = getTestCompilerHostWithMockComponent();
            var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);
            var sourceParser = new source_parser_1.SourceParser({ rootDir: './', files: sourceFiles }, program);
            var _a = sourceParser.getProjectSourceDocumentation(), classesWithDocs = _a.classesWithDocs, otherClasses = _a.otherClasses;
            var testSourceParser = new test_source_parser_1.TestSourceParser({ files: sourceFiles }, program);
            testDocs = testSourceParser.getProjectTestDocumentation(classesWithDocs, otherClasses);
        });
        it('should parse files and return list with TestDocs', function () {
            assert.equal(testDocs.length, 1);
        });
        it('should parse and verify that TestDocs.includeTestForComponent is valid', function () {
            var firstTestDoc = testDocs[0];
            assert.equal(firstTestDoc.includeTestForComponent, 'FoobarComponent');
        });
        it('should parse and verify that TestDocs.moduleSetup is valid', function () {
            var firstTestDoc = testDocs[0];
            assert.deepEqual(firstTestDoc.moduleSetup.imports, ['CommonModule', 'HttpClientTestingModule']);
            assert.deepEqual(firstTestDoc.moduleSetup.declarations, ['FoobarComponent']);
            assert.deepEqual(firstTestDoc.moduleSetup.providers, ['{ provide: CustomService, useValue: { foo: true, bar: [{ a: 1}, 2, \'foo bar\']}, _bar: true, \'foo-bar\': false, $foo: "foo", fooFn: (foo) => { /** jsdoc should be ok */ return foo += 123; }, query: \'?foobar=true!#hashbang\' }', 'AnotherService']);
        });
        it('should parse and verify that TestDocs.examples contains valid component properties', function () {
            var firstTestDoc = testDocs[0];
            firstTestDoc.examples.forEach(function (example, exampleIndex) {
                example.componentProperties.forEach(function (componentProperty, index) {
                    assert.equal(componentProperty.name, 'component');
                    if (exampleIndex === 0) {
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'component.title = "Test title"');
                        }
                        else if (index === 1) {
                            assert.equal(componentProperty.expression, 'component.options = ["item-1", "item-2", "item-3"]');
                        }
                    }
                    else if (exampleIndex === 1) {
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'component.title = \'Test title 2\'');
                        }
                        else if (index === 1) {
                            assert.equal(componentProperty.expression, 'component.options = [\'item-1\', \'item-2\']');
                        }
                    }
                    else if (exampleIndex === 2) {
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'component.title = getTitle()');
                        }
                        else if (index === 1) {
                            assert.equal(componentProperty.expression, 'component.options = getOptions()');
                        }
                    }
                    else if (exampleIndex === 3) {
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'component.title = "Test with http request"');
                        }
                        else if (index === 1) {
                            assert.equal(componentProperty.expression, 'component.options = ["item-1", "item-2", "item-3"]');
                        }
                    }
                    else if (exampleIndex === 4) {
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'component.title = "Test with http request error"');
                        }
                        else if (index === 1) {
                            assert.equal(componentProperty.expression, 'component.options = ["item-1", "item-2", "item-3"]');
                        }
                    }
                    else {
                        assert.equal(true, false, 'Should not be executed');
                    }
                });
                example.httpRequests.forEach(function (httpRequest, index) {
                    if (exampleIndex === 0 || exampleIndex === 1 || exampleIndex === 2) {
                        assert.equal(true, false, 'Should not have any http request in test');
                    }
                    else if (exampleIndex === 3) {
                        if (index === 0) {
                            assert.equal(httpRequest.name, 'request');
                            assert.equal(httpRequest.expression, 'request.flush(\'Should return this text\')');
                            assert.equal(httpRequest.url, '/foobar');
                        }
                    }
                    else if (exampleIndex === 4) {
                        if (index === 0) {
                            assert.equal(httpRequest.name, 'request');
                            assert.equal(httpRequest.expression, 'request.error(new ErrorEvent(\'Server error\', { error: new Error(\'503\'), message: \'Server error\' }))');
                            assert.equal(httpRequest.url, '/error-url');
                        }
                    }
                    else {
                        assert.equal(true, false, 'Should not be executed');
                    }
                });
                if (exampleIndex === 0) {
                    assert.equal(example.sourceCode, "@Component({\n  selector: 'example-host',\n  template: `<x-foobar [options]=\"options\"></x-foobar>`\n})\nclass ExampleHostComponent {}");
                    assert.equal(example.title, 'Custom title for example');
                    assert.equal(example.bootstrapComponent, 'FoobarComponent');
                }
                else if (exampleIndex === 1) {
                    assert.equal(example.sourceCode, "@Component({\n  selector: 'example-host',\n  template: `<x-foobar [options]=\"options\" [disabled]=\"disabled\"></x-foobar>`\n})\nclass ExampleHostComponent {}");
                    assert.equal(example.title, '', 'Should not have a title set');
                    assert.equal(example.bootstrapComponent, 'FoobarComponent');
                }
                else if (exampleIndex === 2) {
                    assert.equal(example.sourceCode, "@Component({\n  selector: 'example-host',\n  template: `<x-foobar [options]=\"options\"></x-foobar>`\n})\nclass ExampleHostComponent {}");
                    assert.equal(example.title, 'Title-with-dashes_and_"other" _\'01234$#%\'56,()=789 special chars');
                    assert.equal(example.bootstrapComponent, 'FoobarComponent');
                }
                else if (exampleIndex === 3) {
                    assert.equal(example.sourceCode, "@Component({\n  selector: 'example-host',\n  template: `<x-foobar [options]=\"options\"></x-foobar>`\n})\nclass ExampleHostComponent {}");
                    assert.equal(example.title, 'Another custom title');
                    assert.equal(example.bootstrapComponent, 'FoobarComponent');
                }
                else if (exampleIndex === 4) {
                    assert.equal(example.sourceCode, "@Component({\n  selector: 'example-host',\n  template: `<x-foobar [options]=\"options\"></x-foobar>`\n})\nclass ExampleHostComponent {}");
                    assert.equal(example.title, 'Title with number  1234');
                    assert.equal(example.bootstrapComponent, 'FoobarComponent');
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that TestDocs.importStatements contains test imports', function () {
            var firstTestDoc = testDocs[0];
            firstTestDoc.importStatements.forEach(function (importStatement, index) {
                if (index === 0) {
                    assert.equal(importStatement.value, 'import { Component, NgModule, Directive, Injectable, Pipe, PipeTransform } from \'@angular/core\';');
                    assert.equal(importStatement.path, '\'@angular/core\'');
                }
                else if (index === 1) {
                    assert.equal(importStatement.value, 'import { async, ComponentFixture, TestBed, TestModuleMetadata } from \'@angular/core/testing\';');
                    assert.equal(importStatement.path, '\'@angular/core/testing\'');
                }
                else if (index === 2) {
                    assert.equal(importStatement.value, 'import { FoobarComponent } from \'./foobar.component.ts\';');
                    assert.equal(importStatement.path, '\'./foobar.component.ts\'');
                }
            });
        });
        it('should parse and verify that TestDocs.fileName is valid', function () {
            var firstTestDoc = testDocs[0];
            assert.equal(firstTestDoc.fileName, 'foobar.component.test.ts');
        });
        it('should parse and verify that TestDocs.inlineFunctions contains getOptions() and getTitle()', function () {
            var firstTestDoc = testDocs[0];
            firstTestDoc.inlineFunctions.forEach(function (inlineFunction, index) {
                if (index === 0) {
                    assert.equal(new RegExp(/function\sgetOptions\(\)\s\{/i).test(inlineFunction), true);
                }
                else if (index === 1) {
                    assert.equal(new RegExp(/function\sgetTitle\(\)\s\{/i).test(inlineFunction), true);
                }
                else if (index === 2) {
                    assert.equal(new RegExp(/function\sfunctionThatIsNotUsedInTestShouldAlsoBeIncluded\(\)\s\{/i).test(inlineFunction), true);
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that TestDocs.inlineClasses contain all declared classes in file', function () {
            var firstTestDoc = testDocs[0];
            firstTestDoc.inlineClasses.forEach(function (inlineClass, index) {
                if (index === 0) {
                    assert.equal(inlineClass.name, 'InlineTestComponent');
                    assert.equal(inlineClass.source.indexOf('@Component({') > -1, true);
                    assert.equal(inlineClass.source.indexOf('template: \'<p>inline-test</p>\'') > -1, true);
                    assert.equal(inlineClass.source.indexOf('templateUrl:') === -1, true);
                    assert.equal(inlineClass.source.indexOf('styleUrls:') === -1, true);
                    assert.equal(inlineClass.source.indexOf('styles:') === -1, true);
                }
                else if (index === 1) {
                    assert.equal(inlineClass.name, 'InlineTestWithTemplateUrlComponent');
                    assert.equal(inlineClass.source.indexOf('@Component({') > -1, true);
                    assert.equal(inlineClass.source.indexOf('template: `\n<p>inline-test-with-external-template-using-template-url</p>\n`') > -1, true);
                    assert.equal(inlineClass.source.indexOf('templateUrl:') === -1, true);
                    assert.equal(inlineClass.source.indexOf('styleUrls:') === -1, true);
                    assert.equal(inlineClass.source.indexOf('styles: [`:host { background-color: #000; }.foobar { color: #fff; }`]') > -1, true);
                }
                else if (index === 2) {
                    assert.equal(inlineClass.name, 'InlineTestModule');
                    assert.equal(inlineClass.source.indexOf('@NgModule({') > -1, true);
                    assert.equal(inlineClass.source.indexOf('imports: []') > -1, true);
                    assert.equal(inlineClass.source.indexOf('declarations: []') > -1, true);
                    assert.equal(inlineClass.source.indexOf('exports: []') > -1, true);
                }
                else if (index === 3) {
                    assert.equal(inlineClass.name, 'InlineDirective');
                    assert.equal(inlineClass.source.indexOf('@Directive({') > -1, true);
                    assert.equal(inlineClass.source.indexOf('selector: \'[xInlineDirective]\'') > -1, true);
                }
                else if (index === 4) {
                    assert.equal(inlineClass.name, 'InlineService');
                    assert.equal(inlineClass.source.indexOf('@Injectable()') > -1, true);
                }
                else if (index === 5) {
                    assert.equal(inlineClass.name, 'InlinePipe');
                    assert.equal(inlineClass.source.indexOf('@Pipe({') > -1, true);
                    assert.equal(inlineClass.source.indexOf('name: \'inlinePipe\'') > -1, true);
                }
                else if (index === 6) {
                    assert.equal(inlineClass.name, 'InlineClassWithNoNgDecorator');
                    assert.equal(inlineClass.source.indexOf('propertyValue = true;') > -1, true);
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
    });
    describe('getProjectTestDocumentation - with test host component', function () {
        var testDocs;
        beforeEach(function () {
            var sourceFiles = ['foobar.component.ts', 'foobar.module.ts', 'foobar.component.test.ts'];
            var compilerHost = getTestCompilerHostWithMockModuleAndTestHostComponent();
            var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);
            var sourceParser = new source_parser_1.SourceParser({ rootDir: './', files: sourceFiles }, program);
            var _a = sourceParser.getProjectSourceDocumentation(), classesWithDocs = _a.classesWithDocs, otherClasses = _a.otherClasses;
            var testSourceParser = new test_source_parser_1.TestSourceParser({ files: sourceFiles }, program);
            testDocs = testSourceParser.getProjectTestDocumentation(classesWithDocs, otherClasses);
        });
        it('should parse files and return list with TestDocs when using test host component', function () {
            assert.equal(testDocs.length, 1);
        });
        it('should parse and verify that TestDocs.includeTestForComponent is valid when using test host component', function () {
            var firstTestDoc = testDocs[0];
            assert.equal(firstTestDoc.includeTestForComponent, 'FoobarComponent');
        });
        it('should parse and verify that TestDocs.examples is valid when using test host component', function () {
            var firstTestDoc = testDocs[0];
            firstTestDoc.examples.forEach(function (example, exampleIndex) {
                example.componentProperties.forEach(function (componentProperty, index) {
                    if (exampleIndex === 0) {
                        assert.equal(componentProperty.name, 'hostComponent');
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'hostComponent.content = "Test content"');
                        }
                    }
                    else if (exampleIndex === 1) {
                        assert.equal(componentProperty.name, 'hostComponent');
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'hostComponent.content = "Test with http request"');
                        }
                    }
                    else if (exampleIndex === 2) {
                        assert.equal(componentProperty.name, 'hostComponent2');
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'hostComponent2.content = "Test with http request error"');
                        }
                    }
                    else if (exampleIndex === 3) {
                        assert.equal(componentProperty.name, 'hostComponent2');
                        if (index === 0) {
                            assert.equal(componentProperty.expression, 'hostComponent2.content = "Test with other hostcomponent"');
                        }
                    }
                    else {
                        assert.equal(true, false, 'Should not be executed');
                    }
                });
                example.httpRequests.forEach(function (httpRequest, index) {
                    if (exampleIndex === 0) {
                        assert.equal(true, false, 'Should not have any http request in test');
                    }
                    else if (exampleIndex === 1) {
                        if (index === 0) {
                            assert.equal(httpRequest.name, 'httpRequest');
                            assert.equal(httpRequest.expression, 'httpRequest.flush(\'Should return this text\')');
                            assert.equal(httpRequest.url, '/foobar');
                        }
                    }
                    else if (exampleIndex === 2) {
                        if (index === 0) {
                            assert.equal(httpRequest.name, 'httpRequest');
                            assert.equal(httpRequest.expression, 'httpRequest.error(new ErrorEvent(\'Server error\', { error: new Error(\'503\'), message: \'Server error\' }))');
                            assert.equal(httpRequest.url, '/error-url');
                        }
                    }
                    else if (exampleIndex === 3) {
                        if (index === 0) {
                            assert.equal(httpRequest.name, 'httpRequest');
                            assert.equal(httpRequest.expression, 'httpRequest.flush(\'Should return this text\')');
                            assert.equal(httpRequest.url, '/foobar');
                        }
                    }
                    else {
                        assert.equal(true, false, 'Should not be executed');
                    }
                });
                if (exampleIndex === 0) {
                    assert.equal(example.title, 'Custom title for example');
                    assert.equal(example.sourceCode, "@Component({\n          selector: 'x-foobar-test-host',\n          template: '<x-foobar><p>{{content}}</p></x-foobar>'\n      })\n      export class FoobarComponentTestHost {\n          content: string;\n          // ...\n      }");
                    assert.equal(example.bootstrapComponent, 'FoobarComponentTestHost');
                }
                else if (exampleIndex === 1) {
                    assert.equal(example.title, '', 'Should not have a title set');
                    assert.equal(example.sourceCode, "@Component({\n          selector: 'x-foobar-test-host',\n          template: '<x-foobar><p>{{content}}</p></x-foobar>'\n      })\n      export class FoobarComponentTestHost {\n          content: string;\n          // ...\n      }");
                    assert.equal(example.bootstrapComponent, 'FoobarComponentTestHost');
                }
                else if (exampleIndex === 2) {
                    assert.equal(example.title, 'Another custom title');
                    assert.equal(example.bootstrapComponent, 'FooComponentTestHost');
                    assert.equal(example.sourceCode, "@Component({\n          selector: 'x-foo-test-host',\n          template: '<x-foo><p>{{content}}</p></x-foo>'\n      })\n      export class FooComponentTestHost {\n          content: string;\n          // ...\n      }");
                }
                else if (exampleIndex === 3) {
                    assert.equal(example.title, 'Another custom title with special hostcomponent');
                    assert.equal(example.bootstrapComponent, 'FooComponentTestHost');
                    assert.equal(example.sourceCode, "@Component({\n          selector: 'x-foo-test-host',\n          template: '<x-foo><p>{{content}}</p></x-foo>'\n      })\n      export class FooComponentTestHost {\n          content: string;\n          // ...\n      }");
                }
                else {
                    assert.equal(true, false, 'Should not be executed');
                }
            });
        });
        it('should parse and verify that TestDocs.moduleSetup is valid when using test host component', function () {
            var firstTestDoc = testDocs[0];
            assert.deepEqual(firstTestDoc.moduleSetup.imports, ['FoobarModule', 'FormsModule', 'HttpClientTestingModule']);
            assert.deepEqual(firstTestDoc.moduleSetup.declarations, ['FoobarComponentTestHost', 'FooComponentTestHost']);
        });
    });
});
function getTestCompilerHostWithMockComponent() {
    var testSourceFileContent = "\n    import { Component, NgModule, Directive, Injectable, Pipe, PipeTransform } from '@angular/core';\n    import { async, ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';\n    import { FoobarComponent } from './foobar.component.ts';\n    import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing.ts';\n\n    interface TestRequest {}\n\n    describe('FoobarComponent', () => {\n        let component: FoobarComponent;\n        let fixture: ComponentFixture<FoobarComponent>;\n        let httpMock: HttpTestingController;\n      \n        beforeEach(async(() => {\n          /** \n           * @uijar  FoobarComponent  \n           */\n          let moduleDef: TestModuleMetadata = {\n              imports: [CommonModule, HttpClientTestingModule],\n              declarations: [FoobarComponent],\n              providers: [{ provide: CustomService, useValue: { foo: true, bar: [{ a: 1}, 2, 'foo bar']}, _bar: true, 'foo-bar': false, $foo: \"foo\", fooFn: (foo) => { /** jsdoc should be ok */ return foo += 123; }, query: '?foobar=true!#hashbang' }, AnotherService]\n            };\n          TestBed.configureTestingModule(moduleDef).compileComponents();\n        }));\n      \n        beforeEach(() => {\n          fixture = TestBed.createComponent(FoobarComponent);\n          component = fixture.componentInstance;\n          fixture.detectChanges();\n        });\n        \n        // @uijarexample Custom title for example\n        it('should parse test correct when using double quotes to set property value', () => {\n            component.title = \"Test title\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n\n            // ...\n        });\n\n        /** @uijarexample */\n        it('should parse test correct when using single quotes to set property value', () => {\n            component.title = 'Test title 2';\n            component.options = ['item-1', 'item-2'];\n            component.disabled = true;\n\n            // ...\n        });\n\n        /** \n         * @uijarexample Title-with-dashes_and_\"other\" _'01234$#%'56,()=789 special chars            */\n        it('should parse test correct when using inline function to set property value', () => {\n            function getOptions() {\n                return [\"item-1\", \"item-2\", \"item-3\"];\n            }\n\n            function getTitle() {\n                return \"Test title\";\n            }\n\n            component.title = getTitle();\n            component.options = getOptions();\n\n            // ...\n        });\n\n        function functionThatIsNotUsedInTestShouldAlsoBeIncluded() {\n            return null;\n        }\n\n        it('should ignore tests without /** @uijarexample */ annotation', () => {\n            component.title = \"Title should not be visible in parse\";\n        });\n\n        /** \n            * @uijarexample Another custom title \n         * \n        */\n        it('should parse http request in test (flush)', () => {\n            component.title = \"Test with http request\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n            const request: TestRequest = httpMock.expectOne('/foobar');\n            request.flush('Should return this text');\n\n            // ...\n        });\n\n        /** \n         * @uijarexample  Title with number  1234     \n         * **/\n        it('should parse http request in test (error)', () => {\n            component.title = \"Test with http request error\";\n            component.options = [\"item-1\", \"item-2\", \"item-3\"];\n            const request: TestRequest = httpMock.expectOne('/error-url');\n            request.error(new ErrorEvent('Server error', { error: new Error('503'), message: 'Server error' }));\n\n            // ...\n        });\n      });\n\n      @Component({\n          selector: 'x-inline-test',\n          template: '<p>inline-test</p>'\n      })\n      export class InlineTestComponent {\n          // ...\n      }\n\n      @Component({\n          selector: 'x-inline-test-with-template-url',\n          templateUrl: './inline-test-with-template-url.html',\n          styleUrls: [\n              './inline-test-with-style-urls-1.css',\n              './inline-test-with-style-urls-2.css'\n          ]\n      })\n      export class InlineTestWithTemplateUrlComponent {\n          // ...\n      }\n\n      @NgModule({\n          imports: [],\n          declarations: [],\n          exports: []\n      })\n      export class InlineTestModule {\n          // ...\n      }\n\n      @Directive({\n          selector: '[xInlineDirective]'\n      })\n      export class InlineDirective {\n          // ...\n      }\n\n      @Injectable()\n      export class InlineService {\n          // ...\n      }\n\n      @Pipe({\n          name: 'inlinePipe'\n      })\n      export class InlinePipe implements PipeTransform {\n          // ...\n      }\n\n      class InlineClassWithNoNgDecorator {\n          propertyValue = true;\n          // ...\n      }\n    ";
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
function getTestCompilerHostWithMockModuleAndTestHostComponent() {
    var testSourceFileContent = "\n    import { Component } from '@angular/core';\n    import { FormsModule } from '@angular/forms';\n    import { async, ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';\n    import { FoobarModule } from './foobar.module.ts';\n    import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing.ts';\n\n    interface TestRequest {}\n\n    describe('FoobarComponent', () => {\n        let hostComponent: FoobarComponentTestHost;\n        let hostComponent2: FooComponentTestHost;\n        let fixture: ComponentFixture<FoobarComponentTestHost>;\n        let fixture2: ComponentFixture<FooComponentTestHost>;\n        let httpMock: HttpTestingController;\n      \n        beforeEach(async(() => {\n          /** \n           * @uijar FoobarComponent\n           * @hostcomponent FoobarComponentTestHost \n           */\n          TestBed.configureTestingModule({\n            imports: [FoobarModule, FormsModule, HttpClientTestingModule],\n            declarations: [FoobarComponentTestHost, FooComponentTestHost]\n          }).compileComponents();\n        }));\n      \n        beforeEach(() => {\n          fixture = TestBed.createComponent(FoobarComponentTestHost);\n          hostComponent = fixture.componentInstance;\n          fixture2 = TestBed.createComponent(FooComponentTestHost);\n          hostComponent2 = fixture.componentInstance;\n          fixture.detectChanges();\n        });\n        \n        /** @uijarexample Custom title for example */\n        it('should parse test correct when using test host', () => {\n            hostComponent.content = \"Test content\";\n\n            // ...\n        });\n\n        /** @uijarexample */\n        it('should parse http request in test (flush)', () => {\n            hostComponent.content = \"Test with http request\";\n            const httpRequest: TestRequest = httpMock.expectOne('/foobar');\n            httpRequest.flush('Should return this text');\n\n            // ...\n        });\n\n        /**\n         * @uijarexample Another custom title\n         * @hostcomponent FooComponentTestHost  \n         **/\n        it('should parse http request in test (error) and use other hostcomponent', () => {\n            hostComponent2.content = \"Test with http request error\";\n            const httpRequest: TestRequest = httpMock.expectOne('/error-url');\n            httpRequest.error(new ErrorEvent('Server error', { error: new Error('503'), message: 'Server error' }));\n\n            // ...\n        });\n\n        // @uijarexample Another custom title with special hostcomponent\n        //@hostcomponent FooComponentTestHost\n        it('should parse http request in test (flush) and use other hostcomponent', () => {\n            hostComponent2.content = \"Test with other hostcomponent\";\n            const httpRequest: TestRequest = httpMock.expectOne('/foobar');\n            httpRequest.flush('Should return this text');\n\n            // ...\n        });\n\n      });\n\n      @Component({\n          selector: 'x-foobar-test-host',\n          template: '<x-foobar><p>{{content}}</p></x-foobar>'\n      })\n      export class FoobarComponentTestHost {\n          content: string;\n          // ...\n      }\n\n      @Component({\n          selector: 'x-foo-test-host',\n          template: '<x-foo><p>{{content}}</p></x-foo>'\n      })\n      export class FooComponentTestHost {\n          content: string;\n          // ...\n      }\n    ";
    var sourceFileContent = "\n        import { Component, Input } from '@angular/core';\n\n        /**\n         * @group Layout\n         * @component Foobar\n         */\n        @Component({\n            selector: 'x-foobar',\n            template: '<ng-content></ng-content>'\n        })\n        export class FoobarComponent {\n            title: string;\n            @Input()\n            options: string[];\n        }\n    ";
    var compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    compilerHost.getSourceFile = function (fileName, languageVersion, onError) {
        if (fileName.indexOf('.test.ts') > -1) {
            return ts.createSourceFile(fileName, testSourceFileContent, ts.ScriptTarget.ES5);
        }
        return ts.createSourceFile(fileName, sourceFileContent, ts.ScriptTarget.ES5);
    };
    compilerHost.fileExists = function (fileName) {
        if (fileName.indexOf('.module.ts') > -1) {
            return true;
        }
    };
    return compilerHost;
}

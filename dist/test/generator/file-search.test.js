"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var sinon = require("sinon");
var fs = require("fs");
var ts = require("typescript");
var file_search_1 = require("../../src/generator/file-search");
describe('FileSearch', function () {
    describe('getFiles', function () {
        it('should get all files that ends with ".ts" in directory', function () {
            var shouldBeIncluded = ['foo.ts', 'foobar.ts', 'foo.test.ts'];
            var shouldNotBeIncluded = ['foobar.txt', 'bar.js'];
            var readdirSyncStub = sinon.stub(fs, 'readdirSync');
            readdirSyncStub.returns(shouldBeIncluded.concat(shouldNotBeIncluded));
            var statSyncStub = sinon.stub(fs, 'statSync');
            statSyncStub.returns({ isDirectory: function () { return false; }, isFile: function () { return true; } });
            var fileSearch = new file_search_1.FileSearch([/\.ts$/], []);
            var result = fileSearch.getFiles('./app/root/dir');
            var filterResult = result.filter(function (fileName) {
                return shouldBeIncluded.find(function (includedFileName) { return new RegExp(includedFileName + '$', 'gi').test(fileName); });
            });
            assert.equal(result.length, shouldBeIncluded.length, 'Result and expected length should be equal');
            assert.deepEqual(filterResult, result, 'Expected file search result to be only included files');
            readdirSyncStub.restore();
            statSyncStub.restore();
        });
    });
    describe('getTestFiles', function () {
        it('should get all files that includes test with @uijar annotations', function () {
            var filesInSearch = ['foo.ts', 'foobar.ts', 'foo.test.ts', 'bar.test.ts'];
            var readdirSyncStub = sinon.stub(fs, 'readdirSync');
            readdirSyncStub.returns(filesInSearch);
            var statSyncStub = sinon.stub(fs, 'statSync');
            statSyncStub.returns({ isDirectory: function () { return false; }, isFile: function () { return true; } });
            var fileSearch = new file_search_1.FileSearch([/\.ts$/], []);
            var files = fileSearch.getFiles('./app/root/dir');
            var compilerHost = getTestCompilerHost();
            var program = ts.createProgram(files.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS }, compilerHost);
            var testFiles = fileSearch.getTestFiles(files, program);
            assert.equal(testFiles.length, 2, 'Only two files "foo.test.ts" and "bar.test.ts" should include tests.');
            testFiles.forEach(function (testFile) {
                if (testFile.indexOf('foo.test.ts') > -1) {
                    assert.equal(testFile.indexOf('foo.test.ts') > -1, true, 'Test file should be "foo.test.ts".');
                }
                else if (testFile.indexOf('bar.test.ts') > -1) {
                    assert.equal(testFile.indexOf('bar.test.ts') > -1, true, 'Test file should be "bar.test.ts".');
                }
                else {
                    assert.equal(false, true, 'If this happens, we have an error in test file search.');
                }
            });
            readdirSyncStub.restore();
            statSyncStub.restore();
        });
    });
});
function getTestCompilerHost() {
    var testSourceFileContent = "\n    describe('TestComponent', () => {\n        let component: TestComponent;\n        let fixture: ComponentFixture<TestComponent>;\n      \n        beforeEach(async(() => {\n          /** \n           * @uijar TestComponent\n           */\n          let moduleDef = { imports: [CommonModule], declarations: [TestComponent] };\n          TestBed.configureTestingModule(moduleDef).compileComponents();\n        }));\n      \n        beforeEach(() => {\n          fixture = TestBed.createComponent(TestComponent);\n          component = fixture.componentInstance;\n          fixture.detectChanges();\n        });\n        \n        /** @uijarexample */\n        it('should be created', () => {\n            // ...\n        });\n      });\n    ";
    var sourceFileContent = "const foobar = true;";
    var compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    compilerHost.getSourceFile = function (fileName, languageVersion, onError) {
        if (fileName.indexOf('.test.ts') > -1) {
            return ts.createSourceFile(fileName, testSourceFileContent, ts.ScriptTarget.ES5);
        }
        return ts.createSourceFile(fileName, sourceFileContent, ts.ScriptTarget.ES5);
    };
    return compilerHost;
}

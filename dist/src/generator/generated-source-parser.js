"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var test_module_writer_1 = require("./test-module-writer");
var GeneratedSourceParser = (function () {
    function GeneratedSourceParser(config, tsOptions) {
        this.config = config;
        var files = config.files;
        this.program = ts.createProgram(files.slice(), tsOptions, this.getCompilerHost());
        this.checker = this.program.getTypeChecker();
    }
    GeneratedSourceParser.prototype.getCompilerHost = function () {
        var testSourceFiles = this.config.testSourceFiles;
        var compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
        compilerHost.getSourceFile = function (fileName, languageVersion, onError) {
            if (fileName.indexOf(test_module_writer_1.TestModuleTemplateWriter.outputFilename) > -1) {
                var sourceFile = testSourceFiles.filter(function (file) {
                    return file.fileName === fileName;
                }).pop();
                return sourceFile;
            }
            return ts.createSourceFile(fileName, fs.readFileSync(fileName, 'UTF-8'), ts.ScriptTarget.ES5);
        };
        return compilerHost;
    };
    GeneratedSourceParser.prototype.getGeneratedDocumentation = function () {
        var moduleDocs = this.getModuleDocs(this.config.files);
        return moduleDocs;
    };
    GeneratedSourceParser.prototype.getModuleDocs = function (moduleFiles) {
        var moduleDocs = [];
        for (var _i = 0, moduleFiles_1 = moduleFiles; _i < moduleFiles_1.length; _i++) {
            var currentFile = moduleFiles_1[_i];
            var sourceFileAsText = this.program.getSourceFile(currentFile).getFullText();
            var moduleDoc = this.getSourceFileData(this.program.getSourceFile(currentFile));
            moduleDoc.includeTestForComponent = this.getIncludedTestForComponent(sourceFileAsText);
            moduleDoc.fileName = this.program.getSourceFile(currentFile).fileName;
            if (moduleDoc.includeTestForComponent) {
                moduleDocs.push(moduleDoc);
            }
        }
        return moduleDocs;
    };
    GeneratedSourceParser.prototype.getIncludedTestForComponent = function (sourceFileAsText) {
        var match = sourceFileAsText.replace(/[\n\r\s]+/gi, '').match(/\/\*\*::ui-jar_source_module::([a-zA-Z0-9_-\s]+)\*\//);
        return match && match.length > 0 ? match[1] : null;
    };
    GeneratedSourceParser.prototype.getSourceFileData = function (node) {
        var details = {};
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                var traverseDecorator_1 = function (decoratorChildNode) {
                    if (decoratorChildNode.kind === ts.SyntaxKind.Identifier && decoratorChildNode.getText() === 'NgModule') {
                        details.moduleRefName = childNode.name.text;
                    }
                    ts.forEachChild(decoratorChildNode, traverseDecorator_1);
                };
                var currentNode = childNode;
                if (currentNode.decorators) {
                    currentNode.decorators.forEach(function (decorator) {
                        traverseDecorator_1(decorator);
                    });
                }
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return details;
    };
    return GeneratedSourceParser;
}());
exports.GeneratedSourceParser = GeneratedSourceParser;

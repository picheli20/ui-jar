"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var module_parser_1 = require("./module-parser");
var component_parser_1 = require("./component-parser");
var SourceParser = (function () {
    function SourceParser(config, program) {
        this.config = config;
        this.program = program;
        this.moduleParser = new module_parser_1.ModuleParser(program);
        this.componentParser = new component_parser_1.ComponentParser(config, program);
    }
    SourceParser.prototype.getProjectSourceDocumentation = function () {
        var _a = this.getComponentAndModuleFiles(this.config.files), componentFiles = _a.componentFiles, moduleFiles = _a.moduleFiles;
        var moduleDocs = this.moduleParser.getModuleDocs(moduleFiles);
        var sourceDocs = this.componentParser.getComponentDocs(componentFiles, moduleDocs);
        return {
            classesWithDocs: sourceDocs.classesWithDocs,
            otherClasses: sourceDocs.otherClasses
        };
    };
    SourceParser.prototype.getComponentAndModuleFiles = function (files) {
        var componentFiles = [];
        var moduleFiles = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var currentFile = files_1[_i];
            if (this.isContainingClass(this.program.getSourceFile(currentFile))) {
                componentFiles.push(currentFile);
            }
            if (this.isModuleFile(this.program.getSourceFile(currentFile))) {
                moduleFiles.push(currentFile);
            }
        }
        return { componentFiles: componentFiles, moduleFiles: moduleFiles };
    };
    SourceParser.prototype.isContainingClass = function (node) {
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                return true;
            }
            return ts.forEachChild(childNode, traverseChild);
        };
        return traverseChild(node) === true;
    };
    SourceParser.prototype.isModuleFile = function (node) {
        var traverseDecorator = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.Identifier && childNode.getText() === 'NgModule') {
                return true;
            }
            return ts.forEachChild(childNode, traverseDecorator);
        };
        var traverseChild = function (childNode) {
            if (childNode.kind == ts.SyntaxKind.Decorator) {
                return ts.forEachChild(childNode, traverseDecorator);
            }
            return ts.forEachChild(childNode, traverseChild);
        };
        return traverseChild(node) === true;
    };
    return SourceParser;
}());
exports.SourceParser = SourceParser;

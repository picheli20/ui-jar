"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var ModuleParser = (function () {
    function ModuleParser(program) {
        this.program = program;
    }
    ModuleParser.prototype.getModuleDocs = function (moduleFiles) {
        var _this = this;
        var moduleDocs = [];
        moduleFiles.forEach(function (currentFile) {
            var moduleDoc = {};
            var details = _this.getModuleSourceData(_this.program.getSourceFile(currentFile));
            moduleDoc.moduleRefName = details.classRefName;
            var sourceFileAsText = _this.program.getSourceFile(currentFile).getFullText();
            moduleDoc.includesComponents = _this.getAllComponentDeclarationsInModule(sourceFileAsText);
            moduleDoc.fileName = _this.program.getSourceFile(currentFile).fileName;
            if (moduleDoc.moduleRefName) {
                moduleDocs.push(moduleDoc);
            }
        });
        return moduleDocs;
    };
    ModuleParser.prototype.getAllComponentDeclarationsInModule = function (sourceFileAsText) {
        var match = sourceFileAsText.replace(/[\n\r\s\t]+/gi, '').match(/exports:\[([a-zA-Z\-_0-9,]+)\]/);
        return match && match.length > 0 ? match[1].split(',') : [];
    };
    ModuleParser.prototype.getModuleSourceData = function (node) {
        var details = {};
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                details.classRefName = childNode.name.text;
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return details;
    };
    return ModuleParser;
}());
exports.ModuleParser = ModuleParser;

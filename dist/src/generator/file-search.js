"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var ts = require("typescript");
var FileSearch = (function () {
    function FileSearch(includes, excludes) {
        if (includes === void 0) { includes = []; }
        if (excludes === void 0) { excludes = []; }
        this.includes = includes;
        this.excludes = excludes;
    }
    FileSearch.prototype.getFiles = function (directory) {
        var _this = this;
        var results = [];
        var files = fs.readdirSync(directory);
        files.forEach(function (file) {
            var filePath = directory + '/' + file;
            var shouldBeExcluded = _this.excludes.find(function (excludeItem) {
                return new RegExp(excludeItem).test(filePath);
            });
            if (shouldBeExcluded) {
                return;
            }
            if (fs.statSync(filePath).isDirectory()) {
                results = results.concat(_this.getFiles(filePath));
            }
            else if (fs.statSync(filePath).isFile()) {
                var shouldBeIncluded = _this.includes.find(function (includeItem) {
                    return new RegExp(includeItem).test(filePath);
                });
                if (shouldBeIncluded) {
                    results.push(path.resolve(filePath));
                }
            }
        });
        return results;
    };
    FileSearch.prototype.getTestFiles = function (files, program) {
        var result = [];
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var currentFile = files_1[_i];
            var isTestFile = this.getTestSourceDetails(program, currentFile);
            if (isTestFile) {
                result.push(currentFile);
            }
        }
        return result;
    };
    FileSearch.prototype.getTestSourceDetails = function (program, currentFile) {
        var _this = this;
        var checker = program.getTypeChecker();
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.VariableDeclaration) {
                var nodeSymbol = checker.getSymbolAtLocation(childNode.name);
                if (nodeSymbol) {
                    var isTestFile = nodeSymbol.getJsDocTags().find(function (docs) {
                        return docs.name === 'uijar';
                    });
                    if (isTestFile) {
                        return true;
                    }
                }
            }
            else if (childNode.kind === ts.SyntaxKind.CallExpression) {
                var isTestFile = _this.containsUIJarAnnotation(childNode);
                if (isTestFile) {
                    return true;
                }
            }
            return ts.forEachChild(childNode, traverseChild);
        };
        return traverseChild(program.getSourceFile(currentFile)) === true;
    };
    FileSearch.prototype.containsUIJarAnnotation = function (node) {
        var jsDoc = node.getFullText().replace(node.getText(), '');
        var regexp = /@uijar\s(.+)/i;
        var matches = jsDoc.match(regexp);
        if (matches) {
            return true;
        }
        return false;
    };
    return FileSearch;
}());
exports.FileSearch = FileSearch;

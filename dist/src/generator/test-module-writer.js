"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var ts = require("typescript");
var path = require("path");
var TestModuleTemplateWriter = (function () {
    function TestModuleTemplateWriter() {
    }
    TestModuleTemplateWriter.prototype.createTestModuleFiles = function (sourceFiles) {
        var encoding = 'UTF-8';
        this.createOutputPathIfNotAlreadyExist(TestModuleTemplateWriter.outputDirectoryPath);
        sourceFiles.forEach(function (sourceFile, index) {
            var javascriptOutput = ts.transpileModule(sourceFile.getFullText(), {
                compilerOptions: {
                    module: ts.ModuleKind.CommonJS,
                    target: ts.ScriptTarget.ES5,
                    removeComments: true
                }
            });
            var outputFilePath = path.resolve(TestModuleTemplateWriter.outputDirectoryPath, sourceFile.fileName.replace(/\.ts$/, '.js'));
            try {
                fs.writeFileSync(outputFilePath, javascriptOutput.outputText, encoding);
            }
            catch (error) {
                console.error(error);
            }
        });
    };
    TestModuleTemplateWriter.prototype.createOutputPathIfNotAlreadyExist = function (path) {
        path.split('//').reduce(function (parent, current) {
            var nextDirectory = parent ? parent + '/' + current : current;
            if (!fs.existsSync(nextDirectory)) {
                fs.mkdirSync(nextDirectory);
            }
            return nextDirectory;
        }, '');
    };
    TestModuleTemplateWriter.outputFilename = '__ui-jar-temp-module';
    TestModuleTemplateWriter.outputDirectoryPath = path.resolve(__dirname, '../../../temp');
    return TestModuleTemplateWriter;
}());
exports.TestModuleTemplateWriter = TestModuleTemplateWriter;

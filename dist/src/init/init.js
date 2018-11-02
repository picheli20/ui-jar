"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var source_parser_1 = require("../generator/source-parser");
var bundle_writer_1 = require("../generator/bundle-writer");
var file_search_1 = require("../generator/file-search");
var test_module_writer_1 = require("../generator/test-module-writer");
var test_module_generator_1 = require("../generator/test-module-generator");
var generated_source_parser_1 = require("../generator/generated-source-parser");
var test_source_parser_1 = require("../generator/test-source-parser");
function getProjectDocumentation(options) {
    var fileSearch = new file_search_1.FileSearch(options.includes, options.excludes);
    var sourceFiles = fileSearch.getFiles(options.directory);
    var rootDir = path.resolve(options.directory).replace(/\\/gi, '/');
    var docs = getProjectSourceDocumentation(sourceFiles, rootDir);
    var testDocs = getProjectTestDocumentation(sourceFiles, docs.classesWithDocs, docs.otherClasses);
    return {
        docs: docs.classesWithDocs,
        testDocs: testDocs
    };
}
function getTestModuleSourceFilesData(testDocs) {
    return new test_module_generator_1.TestModuleGenerator().getTestModuleSourceFiles(testDocs);
}
function generateSingleFile(options, fileName) {
    try {
        var generatedTestModuleSourceFilesData = getTestModuleSourceFilesData(getProjectDocumentation(options).testDocs);
        var updateCurrentSourceFile = generatedTestModuleSourceFilesData.filter(function (file) {
            return new RegExp((fileName.replace(/\\/gi, '/').replace(/\./gi, '\\.') + '$')).test(file.fileName);
        });
        var generatedTestModuleSourceFiles = updateCurrentSourceFile.map(function (file) {
            return file.sourceFile;
        });
        createTestModuleFiles(generatedTestModuleSourceFiles);
    }
    catch (error) {
        console.error("Failed to generate resources to \"" + fileName + "\".");
    }
}
exports.generateSingleFile = generateSingleFile;
function generateRequiredFiles(options) {
    console.info('Generating resources...');
    var _a = getProjectDocumentation(options), docs = _a.docs, testDocs = _a.testDocs;
    var generatedTestModuleSourceFiles = getTestModuleSourceFilesData(testDocs).map(function (file) {
        return file.sourceFile;
    });
    createTestModuleFiles(generatedTestModuleSourceFiles);
    var generatedSourceFileNames = generatedTestModuleSourceFiles.map(function (sourceFile) {
        return sourceFile.fileName;
    });
    var generatedDocs = getGeneratedDocs(generatedSourceFileNames, generatedTestModuleSourceFiles);
    docs.forEach(function (componentDoc) {
        generatedDocs.forEach(function (moduleDocs) {
            if (moduleDocs.includeTestForComponent === componentDoc.componentRefName) {
                componentDoc.moduleDetails = {
                    moduleRefName: moduleDocs.moduleRefName,
                    fileName: moduleDocs.fileName
                };
            }
        });
        testDocs.forEach(function (testDoc) {
            if (testDoc.includeTestForComponent === componentDoc.componentRefName) {
                componentDoc.examples = testDoc.examples;
            }
        });
    });
    docs = getAllAddedComponentsThatHasTest(docs);
    var fileWriter = new bundle_writer_1.BundleTemplateWriter(docs, options.urlPrefix);
    try {
        fileWriter.createBundleFile();
    }
    catch (error) {
        console.error('Failed to generate resources: ', error);
        return;
    }
    console.info('Generated resources successfully.');
}
exports.generateRequiredFiles = generateRequiredFiles;
function getProjectSourceDocumentation(sourceFiles, rootDir) {
    var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    var sourceParser = new source_parser_1.SourceParser({ rootDir: rootDir, files: sourceFiles }, program);
    return sourceParser.getProjectSourceDocumentation();
}
function getProjectTestDocumentation(sourceFiles, classesWithDocs, otherClasses) {
    var program = ts.createProgram(sourceFiles.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    var testSourceParser = new test_source_parser_1.TestSourceParser({ files: sourceFiles }, program);
    return testSourceParser.getProjectTestDocumentation(classesWithDocs, otherClasses);
}
function getGeneratedDocs(generatedSourceFileNames, generatedTestModuleSourceFiles) {
    var generatedDocumentation = new generated_source_parser_1.GeneratedSourceParser({
        files: generatedSourceFileNames,
        testSourceFiles: generatedTestModuleSourceFiles
    }, {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
    });
    return generatedDocumentation.getGeneratedDocumentation();
}
function createTestModuleFiles(files) {
    var testModuleTemplateWriter = new test_module_writer_1.TestModuleTemplateWriter();
    testModuleTemplateWriter.createTestModuleFiles(files);
}
function getAllAddedComponentsThatHasTest(docs) {
    return docs.filter(function (docs) {
        if (docs.componentDocName && docs.groupDocName && (docs.examples && docs.examples.length === 0)) {
            console.info("Could not find any test with /** @uijarexample */ comment for \"" + docs.componentRefName + "\".\nAdd a test and make sure it has a comment as following /** @uijarexample */ to make it visible in UI-jar.");
            return false;
        }
        return true;
    });
}

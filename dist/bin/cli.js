#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var init_1 = require("../src/init/init");
var watcher_1 = require("../src/watcher/watcher");
var file_search_1 = require("../src/generator/file-search");
var ts = require("typescript");
var cli_utils_1 = require("../src/cli/cli-utils");
process.title = 'UI-jar';
try {
    var cliArgs = cli_utils_1.parseCliArguments(process.argv);
    runCliArguments(cliArgs);
}
catch (error) {
    console.error(error.message);
    process.exit();
}
function runCliArguments(cliArgs) {
    if (!cliArgs.directory) {
        throw new Error('Missing required --directory argument, --directory should be a path to your app root directory e.g. "--directory ./src/app".');
    }
    if (!cliArgs.includes) {
        throw new Error('Missing required --includes argument, --includes should be a space separated list of type RegExp e.g. "--includes foo\\.ts$ bar\\.ts$".');
    }
    init_1.generateRequiredFiles(cliArgs);
    if (cliArgs.watch) {
        startFileWatcher(cliArgs);
    }
}
function startFileWatcher(cliArgs) {
    var fileSearch = new file_search_1.FileSearch(cliArgs.includes, cliArgs.excludes);
    var allFilesInDirectory = fileSearch.getFiles(cliArgs.directory);
    var program = ts.createProgram(allFilesInDirectory.slice(), { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
    var testFiles = fileSearch.getTestFiles(allFilesInDirectory, program);
    var fileWatcherOptions = {
        directory: cliArgs.directory,
        files: testFiles
    };
    var fileWatcher = new watcher_1.FileWatcher(fileWatcherOptions);
    fileWatcher.start();
    fileWatcher.addListener(watcher_1.FileWatcherEvent.REBUILD, function (fileName) {
        init_1.generateRequiredFiles(cliArgs);
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var EventEmitter = require("events");
var chokidar_1 = require("chokidar");
exports.FileWatcherEvent = {
    REBUILD: 'REBUILD'
};
var FileWatcher = (function () {
    function FileWatcher(config) {
        this.config = config;
        this.watchEvent = new EventEmitter();
    }
    FileWatcher.prototype.start = function () {
        var _this = this;
        console.info('Watching for file changes.');
        var debounceTime = 500;
        var watchTimer = null;
        var watcher = chokidar_1.watch(path.resolve(this.config.directory), { persistent: true });
        watcher.on('change', function (path) {
            clearTimeout(watchTimer);
            watchTimer = setTimeout(function () { return _this.eventHandler(path); }, debounceTime);
        });
    };
    FileWatcher.prototype.addListener = function (eventType, callback) {
        if (eventType) {
            this.watchEvent.addListener(eventType, callback);
        }
    };
    FileWatcher.prototype.shouldBeIncluded = function (fileName) {
        var result = this.config.files.find(function (testFile) {
            return testFile.endsWith(fileName);
        });
        return result !== undefined;
    };
    FileWatcher.prototype.eventHandler = function (fileName) {
        console.info('File change detected. Starting incremental build...');
        this.watchEvent.emit(exports.FileWatcherEvent.REBUILD, fileName);
        console.info('Watching for file changes.');
    };
    return FileWatcher;
}());
exports.FileWatcher = FileWatcher;

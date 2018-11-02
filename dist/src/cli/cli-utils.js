"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var CliCommandOptions = {
    CONFIG: '--config',
    DIRECTORY: '--directory',
    EXCLUDES: '--excludes',
    INCLUDES: '--includes',
    URL_PREFIX: '--url-prefix',
    WATCH: '--watch'
};
function parseCliArguments(args) {
    args = pluckAdditionalCliArguments(args);
    var formattedArgs = {};
    var isArgumentName = function (value) {
        return value.substr(0, 2) === '--';
    };
    var addArgumentParameter = function (argumentName, value) {
        if (argumentName) {
            if (!formattedArgs[argumentName]) {
                formattedArgs[argumentName] = [value];
            }
            else {
                formattedArgs[argumentName] = formattedArgs[argumentName].concat(value);
            }
        }
    };
    var toCamelCase = function (str) {
        return str.replace(/\-\w/gi, function (match) { return match[1].toUpperCase(); });
    };
    args.reduce(function (currentArgument, value) {
        if (isArgumentName(value)) {
            switch (value) {
                case CliCommandOptions.DIRECTORY:
                case CliCommandOptions.EXCLUDES:
                case CliCommandOptions.CONFIG:
                case CliCommandOptions.INCLUDES:
                case CliCommandOptions.URL_PREFIX:
                    currentArgument = toCamelCase(value.replace('--', ''));
                    break;
                case CliCommandOptions.WATCH:
                    currentArgument = toCamelCase(value.replace('--', ''));
                    addArgumentParameter(currentArgument, true);
                    break;
                default:
                    throw new Error("The specified argument " + value + " is invalid.");
            }
        }
        else {
            addArgumentParameter(currentArgument, value);
        }
        return currentArgument;
    }, '');
    if (formattedArgs.directory) {
        formattedArgs.directory = formattedArgs.directory[0];
    }
    if (formattedArgs.urlPrefix) {
        formattedArgs.urlPrefix = formattedArgs.urlPrefix[0];
    }
    else {
        formattedArgs.urlPrefix = '';
    }
    if (formattedArgs.watch) {
        formattedArgs.watch = formattedArgs.watch[0];
    }
    else {
        formattedArgs.watch = false;
    }
    if (formattedArgs.config) {
        if (formattedArgs.config.length !== 1) {
            throw new Error("Expected to receive the configuration path when using --config.");
        }
        var configPath = path.resolve(formattedArgs.config[0]);
        if (!fs.existsSync(configPath)) {
            throw new Error("Invalid configuration path (" + configPath + ").");
        }
        formattedArgs = __assign({}, formattedArgs, require(configPath));
    }
    return formattedArgs;
}
exports.parseCliArguments = parseCliArguments;
function pluckAdditionalCliArguments(args) {
    return args.slice(2);
}

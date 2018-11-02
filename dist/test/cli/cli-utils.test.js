"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var cli_utils_1 = require("../../src/cli/cli-utils");
describe('CLI', function () {
    describe('parseCliArguments', function () {
        it('should parse all input arguments', function () {
            var cliArgs = ['path/to/node', 'path/to/cli.js',
                '--directory', './src/app',
                '--includes', 'foo\\.ts$', 'bar\\.ts$',
                '--excludes', '\\.exclude\\.ts',
                '--url-prefix', 'ui-jar.html',
                '--watch'];
            var parsedArgs = cli_utils_1.parseCliArguments(cliArgs);
            assert.deepEqual(parsedArgs, {
                directory: './src/app',
                includes: ['foo\\.ts$', 'bar\\.ts$'],
                excludes: ['\\.exclude\\.ts'],
                urlPrefix: 'ui-jar.html',
                watch: true
            }, 'Should match object.');
        });
        it('should parse all input arguments and set defaults', function () {
            var cliArgs = ['path/to/node', 'path/to/cli.js',
                '--directory', './src/app',
                '--includes', '\\.ts$'];
            var parsedArgs = cli_utils_1.parseCliArguments(cliArgs);
            assert.deepEqual(parsedArgs, {
                directory: './src/app',
                includes: ['\\.ts$'],
                urlPrefix: '',
                watch: false
            }, 'Should match object and set defaults.');
        });
        it('should throw exception when invalid argument name is specified', function () {
            var cliArgs = ['path/to/node', 'path/to/cli.js',
                '--not-available-argument', 'not-valid',
                '--includes', '\\.ts$'];
            assert.throws(function () {
                cli_utils_1.parseCliArguments(cliArgs);
            }, 'Should throw exception when argument name is invalid.');
        });
    });
});

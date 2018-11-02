"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var BundleTemplateWriter = (function () {
    function BundleTemplateWriter(documentation, urlPrefix) {
        this.documentation = documentation;
        this.urlPrefix = urlPrefix;
        this.outputFilename = '__ui-jar-temp.js';
        this.outputDirectoryPath = path.resolve(__dirname, '../../../temp');
    }
    BundleTemplateWriter.prototype.getJavascriptFileTemplate = function () {
        var template = "\n            " + this.getModuleImportStatements() + "\n            \n            export function getAppData() {\n                return {\n                    modules:  " + this.getModuleImportNames() + ",\n                    componentRefs: " + this.getComponentRefs() + ",\n                    navigationLinks: " + this.getNavigationLinks() + ",\n                    components: " + this.getComponentData() + ",\n                    urlPrefix: '" + this.urlPrefix + "',\n                    examples: " + this.getComponentExampleProperties() + ",\n                    moduleMetadataOverrides: " + this.getModuleMetadataOverrideProperties() + "\n                };\n            }\n        ";
        return template;
    };
    BundleTemplateWriter.prototype.createBundleFile = function () {
        var encoding = 'UTF-8';
        var javascriptOutput = ts.transpileModule(this.getJavascriptFileTemplate(), {
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES5,
                removeComments: true
            }
        });
        javascriptOutput.outputText = this.updateImportPathsToMatchGeneratedTestModules(javascriptOutput.outputText);
        try {
            this.createOutputPathIfNotAlreadyExist(this.outputDirectoryPath);
            var outputFilePath = path.resolve(this.outputDirectoryPath, this.outputFilename);
            fs.writeFileSync(outputFilePath, javascriptOutput.outputText, encoding);
        }
        catch (error) {
            throw new Error(error);
        }
    };
    BundleTemplateWriter.prototype.updateImportPathsToMatchGeneratedTestModules = function (source) {
        return source.replace(/require\("[\.\/\\]+(__ui-jar-temp-module-[a-z0-9]+)"\)/gi, 'require("\.\/$1")');
    };
    BundleTemplateWriter.prototype.createOutputPathIfNotAlreadyExist = function (path) {
        path.split('//').reduce(function (parent, current) {
            var nextDirectory = parent ? parent + '/' + current : current;
            if (!fs.existsSync(nextDirectory)) {
                fs.mkdirSync(nextDirectory);
            }
            return nextDirectory;
        }, '');
    };
    BundleTemplateWriter.prototype.getModuleImportNames = function () {
        var uniqueModules = this.getUniqueModules();
        var moduleNames = [];
        uniqueModules.forEach(function (item) {
            moduleNames.push(item.moduleDetails.moduleRefName);
        });
        var template = '';
        moduleNames.forEach(function (moduleName, index) {
            template += (index > 0 ? ',' : '') + "{ name: \"" + moduleName + "\", moduleRef: " + moduleName + "}";
        });
        template = "[" + template + "]";
        return template;
    };
    BundleTemplateWriter.prototype.getModuleImportStatements = function () {
        var _this = this;
        var template = '';
        var moduleImports = this.getUniqueModules();
        moduleImports.forEach(function (item) {
            var componentExamplePropertiesFunction = "getComponentExampleProperties as getComponentExampleProperties_" + item.moduleDetails.moduleRefName;
            var moduleMetadataOverridePropertiesFunction = "getModuleMetadataOverrideProperties as getModuleMetadataOverrideProperties_" + item.moduleDetails.moduleRefName;
            var importPath = path.relative(path.resolve(_this.outputDirectoryPath), path.resolve(item.moduleDetails.fileName));
            importPath = importPath.replace('.ts', '').replace(/\\/g, '/');
            template += "import {" + item.moduleDetails.moduleRefName + ", " + item.bootstrapComponents + ", " + componentExamplePropertiesFunction + ", " + moduleMetadataOverridePropertiesFunction + "} from '" + importPath + "';\n";
        });
        return template;
    };
    BundleTemplateWriter.prototype.getUniqueModules = function () {
        var uniqueModules = [];
        this.documentation.forEach(function (item) {
            var isModuleUnique = uniqueModules.filter(function (importedModule) {
                return item.moduleDetails.moduleRefName === importedModule.moduleDetails.moduleRefName;
            }).length === 0;
            var bootstrapComponentsInExample = item.examples.filter(function (example) { return example.bootstrapComponent; })
                .map(function (example) { return example.bootstrapComponent; });
            if (isModuleUnique) {
                uniqueModules.push({
                    moduleDetails: item.moduleDetails,
                    bootstrapComponents: bootstrapComponentsInExample
                });
            }
        });
        return uniqueModules;
    };
    BundleTemplateWriter.prototype.getComponentData = function () {
        var result = {};
        this.documentation.forEach(function (classDoc) {
            result[classDoc.componentRefName] = {
                title: classDoc.componentDocName,
                description: classDoc.description,
                sourceFilePath: classDoc.fileName,
                api: {
                    properties: classDoc.apiDetails.properties,
                    methods: classDoc.apiDetails.methods
                },
                moduleDependencies: [classDoc.moduleDetails.moduleRefName]
            };
        });
        return JSON.stringify(result);
    };
    BundleTemplateWriter.prototype.getComponentExampleProperties = function () {
        var expressions = {};
        this.documentation.forEach(function (classDoc) {
            expressions["" + classDoc.moduleDetails.moduleRefName] = "getComponentExampleProperties_" + classDoc.moduleDetails.moduleRefName + "()";
        });
        var template = Object.keys(expressions).reduce(function (result, exp, index) {
            result += (index > 0 ? ',' : '') + (exp + ": " + expressions[exp]);
            return result;
        }, '');
        template = "{" + template + "}";
        return template;
    };
    BundleTemplateWriter.prototype.getModuleMetadataOverrideProperties = function () {
        var expressions = {};
        this.documentation.forEach(function (classDoc) {
            expressions["" + classDoc.moduleDetails.moduleRefName] = "getModuleMetadataOverrideProperties_" + classDoc.moduleDetails.moduleRefName + "()";
        });
        var template = Object.keys(expressions).reduce(function (result, exp, index) {
            result += (index > 0 ? ',' : '') + (exp + ": " + expressions[exp]);
            return result;
        }, '');
        template = "{" + template + "}";
        return template;
    };
    BundleTemplateWriter.prototype.getComponentRefs = function () {
        var componentRefs = [];
        this.documentation.forEach(function (classDoc) {
            classDoc.examples.forEach(function (example) {
                if (example.bootstrapComponent) {
                    componentRefs.push(example.bootstrapComponent);
                }
            });
        });
        var template = '';
        componentRefs.forEach(function (componentName, index) {
            template += (index > 0 ? ',' : '') + "{ name: \"" + componentName + "\", componentRef: " + componentName + "}";
        });
        template = "[" + template + "]";
        return template;
    };
    BundleTemplateWriter.prototype.getNavigationLinks = function () {
        var _this = this;
        var links = [];
        this.documentation.forEach(function (classDoc) {
            if (classDoc.groupDocName) {
                var linkGroup = links.find(function (section) { return section.groupName === classDoc.groupDocName; });
                if (!linkGroup) {
                    links.push({
                        groupName: classDoc.groupDocName,
                        links: []
                    });
                    linkGroup = links[links.length - 1];
                }
                linkGroup.links.push({
                    title: classDoc.componentDocName,
                    path: _this.urlPrefix ? _this.urlPrefix + '/' + classDoc.componentRefName : classDoc.componentRefName
                });
            }
        });
        links.forEach(function (linkGroup) {
            linkGroup.links.sort(function (itemA, itemB) { return itemA.title.localeCompare(itemB.title); });
        });
        links.sort(function (itemA, itemB) { return itemA.groupName.localeCompare(itemB.groupName); });
        return JSON.stringify(links);
    };
    return BundleTemplateWriter;
}());
exports.BundleTemplateWriter = BundleTemplateWriter;

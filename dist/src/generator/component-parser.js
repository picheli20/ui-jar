"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var fs = require("fs");
var ComponentParser = (function () {
    function ComponentParser(config, program) {
        this.config = config;
        this.program = program;
        this.checker = this.program.getTypeChecker();
    }
    ComponentParser.prototype.getComponentDocs = function (componentFiles, moduleDocs) {
        var _this = this;
        var classesWithDocs = [];
        var otherClasses = [];
        componentFiles.forEach(function (currentFile) {
            var classes = _this.getComponentSourceData(_this.program.getSourceFile(currentFile), currentFile);
            classes.forEach(function (details) {
                var doc = {
                    componentRefName: details.classRefName,
                    componentDocName: details.componentDocName,
                    groupDocName: details.groupDocName,
                    examples: [],
                    description: details.description,
                    apiDetails: {
                        properties: details.properties,
                        methods: details.methods
                    },
                    fileName: _this.program.getSourceFile(currentFile).fileName.replace(_this.config.rootDir, ''),
                    moduleDetails: _this.getModuleDetailsToComponent(details.classRefName, moduleDocs),
                    selector: details.selector,
                    extendClasses: details.extendClasses,
                    source: details.source
                };
                if (doc.componentDocName) {
                    classesWithDocs.push(doc);
                }
                else {
                    otherClasses.push(doc);
                }
            });
        });
        classesWithDocs = this.getPropertiesFromExtendedComponentClasses(classesWithDocs, otherClasses);
        return {
            classesWithDocs: classesWithDocs,
            otherClasses: otherClasses
        };
    };
    ComponentParser.prototype.getModuleDetailsToComponent = function (componentRefName, moduleDocs) {
        var moduleDoc = moduleDocs.find(function (moduleDoc) {
            var componentContainsInModule = moduleDoc.includesComponents.find(function (componentName) {
                return componentName === componentRefName;
            });
            return componentContainsInModule !== undefined;
        });
        if (moduleDoc) {
            return {
                moduleRefName: moduleDoc.moduleRefName,
                fileName: moduleDoc.fileName
            };
        }
    };
    ComponentParser.prototype.getComponentSourceData = function (node, fileName) {
        var _this = this;
        var classes = [];
        var classDetails = {
            properties: [],
            methods: [],
            selector: '',
            extendClasses: [],
            source: ''
        };
        var currentClassDetails = Object.assign({}, classDetails);
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                currentClassDetails = Object.assign({}, classDetails);
                classes.push(currentClassDetails);
                if (childNode.name) {
                    currentClassDetails.classRefName = childNode.name.text;
                    currentClassDetails.selector = _this.getComponentSelector(childNode);
                    currentClassDetails.source = _this.getComponentSourceCode(childNode, fileName);
                    var nodeSymbol = _this.checker.getSymbolAtLocation(childNode.name);
                    nodeSymbol.getJsDocTags().forEach(function (docs) {
                        switch (docs.name) {
                            case 'group':
                                currentClassDetails.groupDocName = docs.text;
                                break;
                            case 'component':
                                currentClassDetails.componentDocName = docs.text;
                                break;
                            case 'description':
                                currentClassDetails.description = docs.text;
                                break;
                        }
                    });
                    nodeSymbol.members.forEach(function (currentMemberSymbol) {
                        var memberDetails = _this.getClassMemberDetails(currentMemberSymbol);
                        if (memberDetails) {
                            currentClassDetails.properties = currentClassDetails.properties.concat(memberDetails.properties);
                            currentClassDetails.methods = currentClassDetails.methods.concat(memberDetails.methods);
                        }
                    });
                }
            }
            else if (childNode.kind === ts.SyntaxKind.HeritageClause) {
                childNode.getChildren().forEach(function (child) {
                    if (child.kind === ts.SyntaxKind.SyntaxList) {
                        var extendClasses = child.getText().split(',');
                        extendClasses = extendClasses.map(function (value) {
                            value = value.trim();
                            value = value.replace(/<.+>/gi, '');
                            return value;
                        }).filter(function (value) { return value !== ''; });
                        currentClassDetails.extendClasses = currentClassDetails.extendClasses.concat(extendClasses);
                    }
                });
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return classes;
    };
    ComponentParser.prototype.getComponentSelector = function (node) {
        var selector = '';
        var traverseDecorator = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.PropertyAssignment
                && childNode.name.getText() === 'selector') {
                selector = childNode.initializer.getText();
                selector = selector.substring(1, selector.length - 1);
            }
            ts.forEachChild(childNode, traverseDecorator);
        };
        var isComponent = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.Identifier && childNode.getText() === 'Component') {
                return true;
            }
            return ts.forEachChild(childNode, isComponent);
        };
        if (node.decorators) {
            node.decorators.forEach(function (decorator) {
                if (isComponent(decorator)) {
                    traverseDecorator(node);
                }
            });
        }
        return selector;
    };
    ComponentParser.prototype.getComponentSourceCode = function (classNode, fileName) {
        var _this = this;
        var getPathToTemplateFile = function (propertyNode) {
            var templateUrl = propertyNode.initializer.getText();
            templateUrl = templateUrl.substring(1, templateUrl.length - 1);
            var pathToTemplateFile = path.resolve(_this.program.getSourceFile(fileName).fileName, '../' + templateUrl);
            return pathToTemplateFile;
        };
        var getPathToStyleFile = function (propertyNode) {
            var styleUrlsAsString = propertyNode.initializer.getText().replace(/[\n\t\r\s]/g, '');
            var styleUrls = styleUrlsAsString.substring(1, styleUrlsAsString.length - 1).split(',');
            return styleUrls.filter(function (styleUrl) { return styleUrl !== ''; }).map(function (styleUrl) {
                return path.resolve(_this.program.getSourceFile(fileName).fileName, '../', styleUrl.substring(1, styleUrl.length - 1));
            });
        };
        var traverseDecorator = function (node) {
            var result = {
                template: '',
                templateUrlNodeAsString: null,
                styles: '',
                styleUrlsNodeAsString: null
            };
            var traverseChild = function (childNode) {
                if (childNode.kind === ts.SyntaxKind.PropertyAssignment) {
                    if (childNode.name.getText() === 'template') {
                        var inlineComponentTemplate = childNode.initializer.getText();
                        inlineComponentTemplate = inlineComponentTemplate.substring(1, inlineComponentTemplate.length - 1);
                        result.template = inlineComponentTemplate;
                    }
                    else if (childNode.name.getText() === 'templateUrl') {
                        var templateUrlNodeAsString = childNode.getText();
                        result.template = fs.readFileSync(getPathToTemplateFile(childNode), 'UTF-8');
                        result.templateUrlNodeAsString = templateUrlNodeAsString;
                    }
                    else if (childNode.name.getText() === 'styleUrls') {
                        var urls = getPathToStyleFile(childNode);
                        urls.forEach(function (styleUrl) {
                            result.styles += fs.readFileSync(styleUrl, 'UTF-8');
                        });
                        result.styleUrlsNodeAsString = childNode.getText();
                    }
                }
                ts.forEachChild(childNode, traverseChild);
            };
            traverseChild(node);
            return result;
        };
        var isComponent = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.Identifier && childNode.getText() === 'Component') {
                return true;
            }
            return ts.forEachChild(childNode, isComponent);
        };
        if (classNode.decorators) {
            var sourceCode = classNode.decorators.reduce(function (sourceCode, decorator) {
                if (isComponent(decorator)) {
                    var result = traverseDecorator(classNode);
                    var source = classNode.getText();
                    if (result.templateUrlNodeAsString) {
                        source = source.replace(result.templateUrlNodeAsString, 'template: `\n' + result.template + '\n`');
                    }
                    if (result.styleUrlsNodeAsString) {
                        source = source.replace(result.styleUrlsNodeAsString, 'styles: [`\n' + result.styles + '\n`]');
                    }
                    sourceCode = source;
                }
                return sourceCode;
            }, null);
            return sourceCode;
        }
        return null;
    };
    ComponentParser.prototype.getClassMemberDetails = function (currentMemberSymbol) {
        var details = {
            properties: [],
            methods: []
        };
        var currentDeclaration = currentMemberSymbol.valueDeclaration;
        if (currentDeclaration) {
            if (this.checkIfSymbolHasPrivateModifier(currentMemberSymbol)) {
                return;
            }
            if (currentDeclaration.kind === ts.SyntaxKind.PropertyDeclaration) {
                details.properties = details.properties.concat(this.getPropertyToDetails(currentMemberSymbol));
            }
            else if (currentDeclaration.kind === ts.SyntaxKind.MethodDeclaration) {
                details.methods = details.methods.concat(this.getMethodToDetails(currentMemberSymbol));
            }
            else if (currentDeclaration.kind === ts.SyntaxKind.GetAccessor
                || currentDeclaration.kind === ts.SyntaxKind.SetAccessor) {
                details.properties = details.properties.concat(this.getAccessorDeclarationToDetails(currentMemberSymbol));
            }
        }
        return details;
    };
    ComponentParser.prototype.getMethodToDetails = function (symbol) {
        var methods = [];
        var nodeComment = this.getNodeComment(symbol);
        var declaration = symbol.valueDeclaration;
        var parametersAsString = this.getMethodParametersAsString(declaration.parameters);
        methods.push({
            methodName: symbol.getName() + "(" + parametersAsString + ")",
            description: nodeComment
        });
        return methods;
    };
    ComponentParser.prototype.getMethodParametersAsString = function (parameters) {
        var parametersAsString = parameters.reduce(function (result, parameter) {
            result.push(parameter.getText());
            return result;
        }, []).join(',');
        return parametersAsString;
    };
    ComponentParser.prototype.checkIfSymbolHasPrivateModifier = function (nodeSymbol) {
        if (!nodeSymbol.valueDeclaration.modifiers) {
            return false;
        }
        var hasPrivateModifier = nodeSymbol.valueDeclaration.modifiers.filter(function (modifier) {
            return modifier.kind === ts.SyntaxKind.PrivateKeyword || modifier.kind === ts.SyntaxKind.ProtectedKeyword;
        }).length > 0;
        return hasPrivateModifier;
    };
    ComponentParser.prototype.getAccessorDeclarationToDetails = function (symbol) {
        var _this = this;
        var properties = [];
        var findIndexForPropertyName = function (propertyName) {
            return properties.findIndex(function (item) {
                return item.propertyName === propertyName;
            });
        };
        symbol.getDeclarations().forEach(function (declaration) {
            var signature = _this.checker.getSignatureFromDeclaration(declaration);
            var nodeComment = _this.getNodeComment(signature);
            var decorators = declaration.decorators;
            var decoratorNames = [];
            if (decorators) {
                decorators.forEach(function (decorator) {
                    decoratorNames.push(decorator.getText());
                });
            }
            var propertyItemIndexPosition = findIndexForPropertyName(symbol.getName());
            if (propertyItemIndexPosition > -1) {
                var propertyItem = properties[propertyItemIndexPosition];
                propertyItem.decoratorNames = propertyItem.decoratorNames.concat(decoratorNames);
                propertyItem.description = propertyItem.description += nodeComment;
            }
            else {
                properties.push({
                    decoratorNames: decoratorNames,
                    propertyName: symbol.getName(),
                    type: _this.checker.typeToString(_this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
                    description: nodeComment
                });
            }
        });
        return properties;
    };
    ComponentParser.prototype.getPropertyToDetails = function (symbol) {
        var properties = [];
        var decorators = symbol.valueDeclaration.decorators;
        var nodeComment = this.getNodeComment(symbol);
        var decoratorNames = [];
        if (decorators) {
            decorators.forEach(function (decorator) {
                decoratorNames.push(decorator.getText());
            });
        }
        properties.push({
            decoratorNames: decoratorNames,
            propertyName: symbol.getName(),
            type: this.checker.typeToString(this.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)),
            description: nodeComment
        });
        return properties;
    };
    ComponentParser.prototype.getNodeComment = function (nodeSymbol) {
        var comment = nodeSymbol.getDocumentationComment(this.checker).reduce(function (result, comment) {
            if (comment.kind === 'text') {
                result += comment.text;
            }
            return result;
        }, '');
        return comment;
    };
    ComponentParser.prototype.getPropertiesFromExtendedComponentClasses = function (classesWithDocs, otherClasses) {
        var docs = classesWithDocs.slice();
        var otherDocsClasses = otherClasses.slice();
        var getAllExtendedClassDocs = function (componentRefName, classes) {
            var result = [];
            var extendedClassDocs = classes.find(function (clazz) {
                return componentRefName === clazz.componentRefName;
            });
            if (extendedClassDocs) {
                result.push(extendedClassDocs);
                extendedClassDocs.extendClasses.forEach(function (extendClassName) {
                    result = result.concat(getAllExtendedClassDocs(extendClassName, classes));
                });
            }
            return result;
        };
        docs.forEach(function (doc) {
            doc.extendClasses.forEach(function (extendClass) {
                var extendedClassDocs = getAllExtendedClassDocs(extendClass, otherDocsClasses);
                if (extendedClassDocs.length > 0) {
                    extendedClassDocs.forEach(function (extendedClass) {
                        doc.apiDetails.properties = doc.apiDetails.properties.concat(extendedClass.apiDetails.properties);
                        doc.apiDetails.methods = doc.apiDetails.methods.concat(extendedClass.apiDetails.methods);
                    });
                }
            });
        });
        return docs;
    };
    return ComponentParser;
}());
exports.ComponentParser = ComponentParser;

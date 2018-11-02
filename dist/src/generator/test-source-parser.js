"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var fs = require("fs");
var TestSourceParser = (function () {
    function TestSourceParser(config, program) {
        this.config = config;
        this.program = program;
        this.checker = this.program.getTypeChecker();
    }
    TestSourceParser.prototype.getProjectTestDocumentation = function (classesWithDocs, otherClasses) {
        var testDocs = this.getTestDocs(this.config.files, classesWithDocs, otherClasses);
        testDocs.filter(function (component) { return component.moduleSetup['imports']; }).forEach(function (component) {
            classesWithDocs.forEach(function (classDoc) {
                if (classDoc.moduleDetails && component.moduleSetup['imports'].indexOf(classDoc.moduleDetails.moduleRefName) > -1) {
                    component.includesComponents = component.includesComponents || [];
                    component.includesComponents.push(classDoc.componentRefName);
                }
            });
        });
        this.verifyBootstrapComponentsIsAvailable(testDocs);
        return testDocs;
    };
    TestSourceParser.prototype.verifyBootstrapComponentsIsAvailable = function (docs) {
        var missingBootstrapComponents = docs.reduce(function (missingComponents, component) {
            var bootstrapComponents = component.examples.map(function (example) { return example.bootstrapComponent; });
            var result = bootstrapComponents.reduce(function (result, bootstrapComponent) {
                if (!(component.includesComponents && component.includesComponents.includes(bootstrapComponent))
                    && !(component.moduleSetup.declarations && component.moduleSetup.declarations.includes(bootstrapComponent))) {
                    result.push(bootstrapComponent);
                }
                return result;
            }, []);
            missingComponents.push.apply(missingComponents, result);
            return missingComponents;
        }, []);
        missingBootstrapComponents.forEach(function (bootstrapComponent) {
            console.error("Could not find any reference to \"" + bootstrapComponent + "\".");
            console.error("1. Verify that \"@uijar " + bootstrapComponent + "\" or \"@hostcomponent " + bootstrapComponent + "\" is using correct component reference name.");
            console.error("2. If you have imported the module that has \"" + bootstrapComponent + "\" in @NgModule({ declarations: [" + bootstrapComponent + "] }) in the test setup, make sure that the imported module also has \"" + bootstrapComponent + "\" in @NgModule({ exports: [" + bootstrapComponent + "] })");
        });
    };
    TestSourceParser.prototype.getTestDocs = function (files, classesWithDocs, otherClasses) {
        var _this = this;
        var docs = [];
        files.forEach(function (currentFile) {
            var details = _this.getTestSourceDetails(_this.program.getSourceFile(currentFile), currentFile, classesWithDocs, otherClasses);
            if (details.includeTestForComponent) {
                docs.push(details);
            }
        });
        return docs;
    };
    TestSourceParser.prototype.getExampleComponentSourceDocs = function (bootstrapComponent, classesWithDocs, otherClasses, details) {
        var exampleComponent = classesWithDocs.concat(otherClasses).find(function (classDoc) {
            return classDoc.componentRefName === (details.hasHostComponent ? bootstrapComponent : details.includeTestForComponent);
        });
        return exampleComponent;
    };
    TestSourceParser.prototype.getExampleSourceCode = function (hasHostComponent, exampleComponent, example) {
        if (hasHostComponent) {
            return exampleComponent.source;
        }
        return this.getComponentSourceCode(exampleComponent, example);
    };
    TestSourceParser.prototype.getComponentSourceCode = function (exampleComponent, example) {
        var template = '';
        if (!exampleComponent) {
            return template;
        }
        var inputProperties = exampleComponent.apiDetails.properties.filter(function (prop) {
            var isInput = prop.decoratorNames.filter(function (decoratorName) {
                return decoratorName.indexOf('@Input(') > -1;
            }).length > 0;
            return isInput;
        });
        var inputPropertiesTemplates = '';
        var exampleComponentProperties = example.componentProperties.map(function (prop) {
            var firstIndexOfEquals = prop.expression.indexOf('=');
            var propertyName = prop.expression.substr(0, firstIndexOfEquals);
            propertyName = propertyName.replace(prop.name, '').replace(/[\s\.\[\]"']+/gi, '');
            return propertyName;
        });
        inputProperties.forEach(function (inputProperty) {
            var isExamplePropertyInput = exampleComponentProperties.find(function (componentProperty) {
                return componentProperty === inputProperty.propertyName;
            });
            if (isExamplePropertyInput) {
                inputPropertiesTemplates += " [" + inputProperty.propertyName + "]=\"" + inputProperty.propertyName + "\"";
            }
        });
        template += "<" + exampleComponent.selector + inputPropertiesTemplates + "></" + exampleComponent.selector + ">";
        return "@Component({\n  selector: 'example-host',\n  template: `" + template + "`\n})\nclass ExampleHostComponent {}";
    };
    TestSourceParser.prototype.getComponentExpressionsFromTest = function (bootstrapComponent, binaryExpressions) {
        var variables = this.convertBinaryExpressionToVariableDeclaration(bootstrapComponent, binaryExpressions);
        var componentVariables = variables.filter(function (item) {
            return item.type === bootstrapComponent;
        });
        var componentExpressions = componentVariables.reduce(function (result, componentVariable) {
            var expressions = binaryExpressions.filter(function (expression) {
                return expression.asString.indexOf(componentVariable.value) === 0;
            }).map(function (expression) {
                return {
                    name: componentVariable.name,
                    expression: expression.asString
                };
            });
            return result = result.concat(expressions);
        }, []);
        return componentExpressions;
    };
    TestSourceParser.prototype.convertBinaryExpressionToVariableDeclaration = function (typeToSearchFor, binaryExpressions) {
        var _this = this;
        var traverseToParent = function (node) {
            var nodeSymbol = _this.checker.getSymbolAtLocation(node);
            var type = null;
            if (nodeSymbol) {
                type = _this.checker.typeToString(_this.checker.getTypeOfSymbolAtLocation(nodeSymbol, nodeSymbol.valueDeclaration));
            }
            if (type === typeToSearchFor) {
                return node;
            }
            return ts.forEachChild(node, traverseToParent);
        };
        var result = binaryExpressions.reduce(function (current, expression) {
            var resultNode = traverseToParent(expression.expression.left);
            if (resultNode) {
                current.push({
                    name: resultNode.getText(),
                    type: typeToSearchFor,
                    value: expression.asString
                });
            }
            return current;
        }, []);
        return result;
    };
    TestSourceParser.prototype.getExampleHttpRequests = function (childNode) {
        var variableDeclarations = this.getVariableDeclarationsDetails(childNode);
        var functionsCall = this.getExampleFunctionCallsDetails(childNode);
        var testRequestTypeAsString = 'TestRequest';
        var testRequests = variableDeclarations.filter(function (item) {
            return item.type === testRequestTypeAsString;
        });
        var httpExpressions = [];
        if (testRequests) {
            testRequests.forEach(function (func) {
                httpExpressions = httpExpressions.concat(functionsCall.filter(function (expression) {
                    return expression.indexOf(func.name + '.flush(') === 0 || expression.indexOf(func.name + '.error(') === 0;
                }).map(function (expression) {
                    var httpRequestMatch = new RegExp(/\.expectOne\((.+)\)/gi).exec(func.value) || [];
                    if (httpRequestMatch.length > 1) {
                        return {
                            name: func.name,
                            expression: expression,
                            url: httpRequestMatch[1].replace(/[\'"]/gi, '')
                        };
                    }
                }));
            });
        }
        return httpExpressions;
    };
    TestSourceParser.prototype.getTestSourceDetails = function (node, fileName, classesWithDocs, otherClasses) {
        var _this = this;
        var details = {
            importStatements: [],
            moduleSetup: {},
            includeTestForComponent: null,
            inlineClasses: [],
            inlineFunctions: [],
            examples: [],
            hasHostComponent: false,
            fileName: this.program.getSourceFile(fileName).fileName,
            moduleMetadataOverride: []
        };
        var bootstrapComponent = null;
        var inlineFunctions = [];
        var parseUIJarJsDocs = function (docs) {
            docs.forEach(function (doc) {
                if (doc.name === 'uijar') {
                    if (!bootstrapComponent) {
                        bootstrapComponent = doc.text;
                    }
                    details.includeTestForComponent = doc.text;
                }
                else if (doc.name === 'hostcomponent') {
                    bootstrapComponent = doc.text;
                    details.hasHostComponent = true;
                }
            });
        };
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ImportDeclaration) {
                var importObj = {
                    value: childNode.getText(),
                    path: _this.getImportStatementDetails(childNode)
                };
                details.importStatements.push(importObj);
            }
            else if (childNode.kind === ts.SyntaxKind.VariableDeclaration) {
                var nodeSymbol_1 = _this.checker.getSymbolAtLocation(childNode.name);
                if (nodeSymbol_1) {
                    var docs = nodeSymbol_1.getJsDocTags().filter(function (docs) {
                        return docs.name && docs.text;
                    }).map(function (docs) {
                        return {
                            name: docs.name,
                            text: docs.text.trim()
                        };
                    });
                    docs.filter(function (doc) { return doc.name === 'uijar'; }).forEach(function (doc) {
                        details.moduleSetup = _this.getModuleDefinitionDetails(nodeSymbol_1.valueDeclaration);
                    });
                    parseUIJarJsDocs(docs);
                }
            }
            else if (childNode.kind === ts.SyntaxKind.ClassDeclaration) {
                details.inlineClasses.push(_this.getInlineClass(childNode, fileName));
            }
            else if (childNode.kind === ts.SyntaxKind.CallExpression) {
                if (_this.isExampleComment(childNode) && bootstrapComponent) {
                    var example = {
                        componentProperties: null,
                        httpRequests: _this.getExampleHttpRequests(childNode),
                        title: _this.getExampleTitle(childNode),
                        sourceCode: '',
                        bootstrapComponent: _this.getExampleHostComponent(childNode),
                        selector: ''
                    };
                    if (!example.bootstrapComponent) {
                        example.bootstrapComponent = bootstrapComponent;
                    }
                    else {
                        details.hasHostComponent = true;
                    }
                    var exampleComponent = _this.getExampleComponentSourceDocs(example.bootstrapComponent, classesWithDocs, otherClasses, details);
                    example.componentProperties = _this.getExampleComponentProperties(childNode, example.bootstrapComponent);
                    example.sourceCode = _this.getExampleSourceCode(details.hasHostComponent, exampleComponent, example);
                    example.selector = exampleComponent.selector;
                    details.examples.push(example);
                }
                else if (_this.isOverrideModuleExpression(childNode)) {
                    details.moduleMetadataOverride.push(_this.getOverrideModuleMetadata(childNode));
                }
                else {
                    var docs = _this.getJsDocTags(childNode);
                    if (docs.length > 0) {
                        docs.filter(function (doc) { return doc.name === 'uijar'; }).forEach(function (doc) {
                            var testModuleDefinitionNode = childNode.arguments[0];
                            if (testModuleDefinitionNode) {
                                if (testModuleDefinitionNode.kind === ts.SyntaxKind.Identifier) {
                                    var nodeSymbol = _this.checker.getSymbolAtLocation(testModuleDefinitionNode);
                                    if (nodeSymbol) {
                                        testModuleDefinitionNode = nodeSymbol.valueDeclaration;
                                    }
                                }
                                details.moduleSetup = _this.getModuleDefinitionDetails(testModuleDefinitionNode);
                            }
                        });
                        parseUIJarJsDocs(docs);
                    }
                }
            }
            else if (childNode.kind === ts.SyntaxKind.FunctionDeclaration) {
                var inlineFunction = _this.getInlineFunction(childNode);
                if (inlineFunction) {
                    inlineFunctions.push(inlineFunction);
                }
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        details.inlineFunctions = inlineFunctions.map(function (inlineFunction) { return inlineFunction.func; });
        return details;
    };
    TestSourceParser.prototype.getVariableDeclarationsDetails = function (node) {
        var _this = this;
        var variableDeclarations = [];
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.VariableDeclaration) {
                var nodeSymbol = _this.checker.getSymbolAtLocation(childNode.name);
                if (nodeSymbol) {
                    var variableType = _this.checker.typeToString(_this.checker.getTypeOfSymbolAtLocation(nodeSymbol, nodeSymbol.valueDeclaration));
                    variableDeclarations.push({
                        name: nodeSymbol.name,
                        type: variableType,
                        value: nodeSymbol.valueDeclaration.getText()
                    });
                }
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return variableDeclarations;
    };
    TestSourceParser.prototype.getOverrideModuleMetadata = function (node) {
        var _this = this;
        var isSetterPropertyAssignment = false;
        var overrideModuleMetadata = {
            moduleRefName: node.arguments[0].getText(),
            entryComponents: []
        };
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.PropertyAssignment) {
                var propertyName = childNode.name.getText();
                if (propertyName === 'set') {
                    isSetterPropertyAssignment = true;
                }
                if (isSetterPropertyAssignment) {
                    if (propertyName === 'entryComponents') {
                        var nodeSymbol = _this.checker.getSymbolAtLocation(childNode.name);
                        if (nodeSymbol && nodeSymbol.valueDeclaration) {
                            var result = nodeSymbol.valueDeclaration.getChildren().find(function (child) {
                                return child.kind === ts.SyntaxKind.ArrayLiteralExpression;
                            });
                            if (result) {
                                var entryComponents = result.elements.map(function (element) { return element.getText(); });
                                overrideModuleMetadata.entryComponents = entryComponents;
                            }
                        }
                    }
                }
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node.arguments[1]);
        return overrideModuleMetadata;
    };
    TestSourceParser.prototype.getInlineFunction = function (inlineFunctionDeclaration) {
        if (inlineFunctionDeclaration.name) {
            return {
                name: inlineFunctionDeclaration.name.getText(),
                func: inlineFunctionDeclaration.getText()
            };
        }
    };
    TestSourceParser.prototype.getJsDocTags = function (node) {
        var jsDoc = node.getFullText().replace(node.getText(), '');
        var result = [];
        var componentName = this.getUIJarComponentName(jsDoc);
        if (componentName) {
            result.push(componentName);
        }
        var hostComponentName = this.getHostComponentName(jsDoc);
        if (hostComponentName) {
            result.push(hostComponentName);
        }
        return result;
    };
    TestSourceParser.prototype.getHostComponentName = function (jsDoc) {
        var regexp = /@hostcomponent\s(.+)/i;
        var matches = jsDoc.match(regexp);
        if (matches) {
            return {
                name: 'hostcomponent',
                text: matches[1].trim()
            };
        }
        return null;
    };
    TestSourceParser.prototype.getUIJarComponentName = function (jsDoc) {
        var regexp = /@uijar\s(.+)/i;
        var matches = jsDoc.match(regexp);
        if (matches) {
            return {
                name: 'uijar',
                text: matches[1].trim()
            };
        }
        return null;
    };
    TestSourceParser.prototype.isExampleComment = function (node) {
        var comment = node.getFullText().replace(node.getText(), '');
        var regexp = /@uijarexample/i;
        var matches = comment.match(regexp);
        if (matches) {
            return true;
        }
        return false;
    };
    TestSourceParser.prototype.isOverrideModuleExpression = function (node) {
        if (node.expression.getText() === 'TestBed.overrideModule') {
            return true;
        }
        return false;
    };
    TestSourceParser.prototype.getExampleTitle = function (node) {
        var comment = node.getFullText().replace(node.getText(), '');
        var regexp = /@uijarexample\s([a-z0-9!"'#$%&\(\)=_\-\s\t\v\,]+)/i;
        var matches = regexp.exec(comment);
        if (matches) {
            return matches[1].trim();
        }
        return '';
    };
    TestSourceParser.prototype.getExampleHostComponent = function (node) {
        var comment = node.getFullText().replace(node.getText(), '');
        var regexp = /@hostcomponent\s([a-z0-9_\-$]+)/i;
        var matches = regexp.exec(comment);
        if (matches) {
            return matches[1].trim();
        }
        return null;
    };
    TestSourceParser.prototype.getExampleComponentProperties = function (node, bootstrapComponent) {
        var expressions = [];
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.BinaryExpression) {
                expressions.push({
                    expression: childNode,
                    asString: childNode.getText()
                });
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return this.getComponentExpressionsFromTest(bootstrapComponent, expressions);
    };
    TestSourceParser.prototype.getExampleFunctionCallsDetails = function (node) {
        var functionCalls = [];
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.CallExpression) {
                functionCalls.push(childNode.getText().replace(/[\n\t\r]+/gi, ''));
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return functionCalls;
    };
    TestSourceParser.prototype.getImportStatementDetails = function (node) {
        var _this = this;
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            return node.getText();
        }
        return ts.forEachChild(node, function (nextNode) { return _this.getImportStatementDetails(nextNode); });
    };
    TestSourceParser.prototype.getModuleDefinitionDetails = function (node) {
        var moduleDefinition = {};
        var parentNode = null;
        var traverseChild = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.ObjectLiteralExpression && !parentNode) {
                parentNode = childNode;
            }
            if (parentNode && parentNode.getText() === childNode.parent.getText()) {
                if (childNode.kind === ts.SyntaxKind.PropertyAssignment) {
                    var propertyName_1 = childNode.name.getText();
                    childNode.getChildren().forEach(function (child) {
                        if (child.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                            child.elements.forEach(function (item) {
                                if (propertyName_1) {
                                    moduleDefinition[propertyName_1] = moduleDefinition[propertyName_1] || [];
                                    moduleDefinition[propertyName_1].push(item.getText());
                                }
                            });
                        }
                    });
                }
            }
            ts.forEachChild(childNode, traverseChild);
        };
        traverseChild(node);
        return moduleDefinition;
    };
    TestSourceParser.prototype.getInlineComponent = function (classNode, fileName) {
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
        var result = traverseDecorator(classNode);
        var source = classNode.getText();
        if (result.templateUrlNodeAsString) {
            source = source.replace(result.templateUrlNodeAsString, 'template: `\n' + result.template + '\n`');
        }
        if (result.styleUrlsNodeAsString) {
            source = source.replace(result.styleUrlsNodeAsString, 'styles: [`' + result.styles + '`]');
        }
        return {
            source: source,
            name: classNode.name.getText()
        };
    };
    TestSourceParser.prototype.getInlineClass = function (classNode, fileName) {
        var _this = this;
        var isComponent = function (childNode) {
            if (childNode.kind === ts.SyntaxKind.Identifier && childNode.getText() === 'Component') {
                return true;
            }
            return ts.forEachChild(childNode, isComponent);
        };
        if (classNode.decorators) {
            var inlineClass = classNode.decorators.reduce(function (clazz, decorator) {
                if (isComponent(decorator)) {
                    return _this.getInlineComponent(classNode, fileName);
                }
                else {
                    clazz = {
                        source: classNode.getText(),
                        name: classNode.name.getText()
                    };
                }
                return clazz;
            }, null);
            return inlineClass;
        }
        return {
            source: classNode.getText(),
            name: classNode.name.getText()
        };
    };
    return TestSourceParser;
}());
exports.TestSourceParser = TestSourceParser;

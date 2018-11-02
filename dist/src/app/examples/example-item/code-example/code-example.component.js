"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var CodeExampleComponent = (function () {
    function CodeExampleComponent() {
        this.isVisible = false;
    }
    CodeExampleComponent.prototype.hide = function () {
        this.isVisible = false;
    };
    CodeExampleComponent.prototype.show = function () {
        this.isVisible = true;
    };
    CodeExampleComponent.prototype.isComponentVisible = function () {
        return this.isVisible;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], CodeExampleComponent.prototype, "sourceCode", void 0);
    __decorate([
        core_1.HostBinding('class.is-visible'),
        __metadata("design:type", Boolean)
    ], CodeExampleComponent.prototype, "isVisible", void 0);
    CodeExampleComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-code-example',
            template: "\n        <code>\n            <pre>{{sourceCode}}</pre>\n        </code>\n    ",
            styles: ["\n        :host {\n            display: none;\n            border-bottom: 1px #c1c1c1 solid;\n            margin: 0 0 20px 0;\n        }\n\n        :host.is-visible {\n            display: block;\n        }\n\n        h2 {\n            margin: 0;\n            padding: 10px;\n            font-family: Arial;\n            font-size: 12px;\n            font-weight: normal;\n        }\n\n        pre {\n            margin: 0;\n            overflow-x: scroll;\n            padding: 20px 10px;\n            background-color: var(--code-example-background);\n\n            font-size: 14px;\n            font-family: monospace;\n        }\n\n        .code-example-nav {\n            border-bottom: 1px #dcdcdc solid;\n        }\n\n        .code-example-nav > ul {\n            list-style-type: none;\n            margin: 0;\n            padding: 0;\n        }\n\n        .code-example-nav > ul > li {\n            float: left;\n        }\n\n        .code-example-nav > ul > li > span {\n            display: block;\n            padding: 10px 20px;\n            background-color: #fff;\n            text-decoration: none;\n            color: var(--contrast-color);\n            font-family: Arial;\n            font-size: 12px;\n            border-bottom: 2px transparent solid;\n            border-top-width: 0;\n            border-right-width: 0;\n            border-left-width: 0;\n            border-color: var(--accent-color);\n        }\n    "]
        })
    ], CodeExampleComponent);
    return CodeExampleComponent;
}());
exports.CodeExampleComponent = CodeExampleComponent;

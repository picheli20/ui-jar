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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var IntroductionComponent = (function () {
    function IntroductionComponent(config) {
        this.config = config;
    }
    IntroductionComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-introduction',
            template: "\n        <div class=\"title-container\" *ngIf=\"!config.homeContent\">\n            <h1 class=\"title\">UI-JAR<span>@</span></h1>\n            <p>Test Driven Style Guide Development</p>\n        </div>\n        <div class=\"title-container\" *ngIf=\"config.homeContent\" [innerHTML]=\"config.homeContent\"></div>\n    ",
            styles: ["\n        :host {\n            font-family: Arial;\n        }\n\n        .title-container {\n            height: 130px;\n            background-color: var(--accent-color);\n            padding: 20px;\n            color: #e8f7ff;\n            text-align: center;\n        }\n\n        .title-container .title {\n            margin: 0;\n            padding: 15px 0 5px 0;\n            font-size: 40px;\n            font-family: Verdana;\n            font-weight: bold;\n        }\n\n        .title-container .title > span {\n            font-size: 20px;\n        }\n\n        .title-container > p {\n            margin: 0;\n            font-size: 14px;\n        }\n    "]
        }),
        __param(0, core_1.Inject('AppConfig')),
        __metadata("design:paramtypes", [Object])
    ], IntroductionComponent);
    return IntroductionComponent;
}());
exports.IntroductionComponent = IntroductionComponent;

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
var router_1 = require("@angular/router");
var ApiComponent = (function () {
    function ApiComponent(activatedRoute, appData) {
        this.activatedRoute = activatedRoute;
        this.appData = appData;
    }
    ApiComponent.prototype.ngOnInit = function () {
        this.createView();
    };
    ApiComponent.prototype.createView = function () {
        this.api = this.appData.components[this.getCurrentComponentName()].api;
    };
    ApiComponent.prototype.getCurrentComponentName = function () {
        var lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length - 1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    };
    ApiComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-api',
            template: "\n        <div *ngIf=\"api.properties.length > 0\" class=\"api-table-container\">\n            <h2>Properties</h2>\n            <table cellspacing=\"0\">\n                <thead>\n                    <tr>\n                        <th class=\"name-header\">Name</th>\n                        <th>Type</th>\n                        <th>Description</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let property of api.properties\">\n                        <td class=\"code-font\">\n                            <ng-container *ngFor=\"let decoratorName of property.decoratorNames\">\n                                <span class=\"decorator-highlight\">{{decoratorName}}</span><br/>\n                            </ng-container>\n                            {{property.propertyName}}\n                        </td>\n                        <td class=\"property-type\">\n                            {{property.type}}\n                        </td>\n                        <td>\n                            <p *ngIf=\"property.description\">{{property.description}}</p>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div *ngIf=\"api.methods.length > 0\" class=\"api-methods-container\">\n            <h2>Methods</h2>\n            <dl>\n                <ng-container *ngFor=\"let method of api.methods\"> \n                    <dt class=\"code-font\">\n                        <ng-container *ngFor=\"let decoratorName of method.decoratorNames\">\n                        <span class=\"decorator-highlight\">{{decoratorName}}</span><br/>\n                        </ng-container>\n                        {{method.methodName}}\n                    </dt>\n                    <dd>\n                        <ng-container *ngIf=\"method.description\">{{method.description}}</ng-container>\n                    </dd>\n                </ng-container>\n            </dl>\n        </div>\n    ",
            styles: ["\n        :host {\n            display: -webkit-flex;\n            display: flex;\n            -webkit-flex-direction: column;\n            flex-direction: column;\n        }\n\n        h2 {\n            font-family: Arial;\n            font-size: 16px;\n            font-weight: bold;\n            padding: 0;\n            margin: 10px 0;\n        }\n\n        .api-table-container {\n            margin-bottom: 30px;\n        }\n\n        .api-methods-container dt, \n        .api-methods-container dd {\n            padding: 10px;\n            margin: 0;\n            text-align: left;\n            line-height: 1.2em;\n        }\n        \n        .api-methods-container dt {    \n            border: 1px var(--border-color) solid;\n            background-color: var(--items-header-background);\n        }\n\n        .api-methods-container dd {\n            font-family: Arial;\n            font-size: 14px;\n            margin-bottom: 20px;\n            border: 1px var(--border-color) solid;\n        }\n\n        table {\n            width: 100%;\n            border: 1px var(--border-color) solid;\n            font-family: Arial;\n            font-size: 14px;\n        }\n\n        table > thead {\n            background-color: var(--items-header-background);\n            border-color: var(--border-color);\n            color: var(--items-header-color);\n        }\n\n        table td,\n        table th {\n            padding: 10px;\n            text-align: left;\n            line-height: 1.2em;\n            border-color: var(--border-color);\n            color: var(--items-header-color);\n            border-width: 0 0 1px 1px;\n            border-style: solid;\n        }\n\n        table .name-header {\n            width: 300px;\n        }\n\n        .code-font {\n            font-family: monospace;\n        }\n\n        .property-type {\n            color: var(--text-highlight);\n        }\n\n        .decorator-highlight {\n            font-size: 12px;\n        }\n    "]
        }),
        __param(1, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [router_1.ActivatedRoute, Object])
    ], ApiComponent);
    return ApiComponent;
}());
exports.ApiComponent = ApiComponent;

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
var ContainerComponent = (function () {
    function ContainerComponent(router, activatedRoute, appData) {
        this.router = router;
        this.activatedRoute = activatedRoute;
        this.appData = appData;
    }
    ContainerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.routerSub = this.router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationEnd) {
                _this.createView();
            }
        });
        this.createView();
    };
    ContainerComponent.prototype.ngOnDestroy = function () {
        this.routerSub.unsubscribe();
    };
    ContainerComponent.prototype.createView = function () {
        var currentComponentName = this.getCurrentComponentName();
        this.title = this.appData.components[currentComponentName].title;
        this.sourceFilePath = this.appData.components[currentComponentName].sourceFilePath;
    };
    ContainerComponent.prototype.getCurrentComponentName = function () {
        var lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length - 1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    };
    ContainerComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-container',
            template: "\n        <div class=\"top-header\">\n            <h2>{{title}}</h2>\n            <div class=\"source-ref\">{{sourceFilePath}}</div>\n        </div>\n        <div class=\"content-container\">\n            <div class=\"sub-nav\">\n                <ul class=\"u-clearfix\">\n                    <li>\n                        <a routerLink=\"overview\" routerLinkActive=\"is-active\">Overview</a>\n                    </li>\n                    <li>\n                        <a routerLink=\"api\" routerLinkActive=\"is-active\">Api</a>\n                    </li>\n                </ul>\n            </div>\n            <router-outlet></router-outlet>\n        </div>\n    ",
            styles: ["\n        :host {\n            display: block;\n        }\n\n        .content-container {\n            padding: 20px 40px;\n        }\n\n        .top-header {\n            height: 130px;\n            background-color: var(--accent-color);\n            padding: 20px 20px 20px 40px;\n        }\n\n        .top-header h2 {\n            margin: 10px 0 0 0;\n            padding: 0;\n            color: var(--accent-contrast-color);\n            font-size: 40px;\n            font-family: Arial;\n            font-weight: bold;\n            word-break: break-word;\n        }\n\n        .sub-nav {\n            border-bottom: 2px #dcdcdc solid;\n            margin-bottom: 20px;\n        }\n\n        .sub-nav > ul {\n            list-style-type: none;\n            margin: 0;\n            padding: 0;\n        }\n\n        .sub-nav > ul > li {\n            float: left;\n        }\n\n        .sub-nav a {\n            display: block;\n            padding: 10px 20px;\n            background-color: var(--main-background);\n            text-decoration: none;\n            color: var(--menu-item-color);\n            font-family: Arial;\n            font-size: 12px;\n            text-transform: uppercase;\n        }\n\n        .sub-nav a.is-active {\n            position: relative;\n            font-weight: bold;\n        }\n\n        .sub-nav a.is-active:after {\n            content: '';\n            position: absolute;\n            left: 0;\n            bottom: -2px;\n            height: 2px;\n            width: 100%;\n            background: var(--accent-color);\n        }\n\n        .source-ref {\n            font-family: Arial;\n            font-size: 12px;\n            font-weight: bold;\n            color: #e8f7ff;\n            margin-top: 5px;\n        }\n\n        .u-clearfix:after {\n            content: \"\";\n            display: table;\n            clear: both;\n        }\n\n        @media (max-width: 767px) {       \n            .content-container {\n                padding: 20px 15px;\n            }\n        \n            .top-header h2 {\n                font-size: 24px;\n            }\n        }\n    "]
        }),
        __param(2, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute, Object])
    ], ContainerComponent);
    return ContainerComponent;
}());
exports.ContainerComponent = ContainerComponent;

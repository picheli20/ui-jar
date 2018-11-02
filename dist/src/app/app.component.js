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
var AppComponent = (function () {
    function AppComponent(config, appData, router) {
        this.config = config;
        this.appData = appData;
        this.router = router;
        this.showNavigation = false;
        this.navigationLinks = appData.navigationLinks;
        this.resetRouteConfigWithPrefixedUrls();
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.routerEventSubscription = this.router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationEnd) {
                _this.showNavigation = false;
            }
        });
    };
    AppComponent.prototype.ngOnDestroy = function () {
        this.routerEventSubscription.unsubscribe();
    };
    Object.defineProperty(AppComponent.prototype, "currentRouteConfig", {
        get: function () {
            var clonedRouteConfig = [];
            this.router.config.forEach(function (route) {
                clonedRouteConfig.push(__assign({}, route));
            });
            return clonedRouteConfig;
        },
        enumerable: true,
        configurable: true
    });
    AppComponent.prototype.resetRouteConfigWithPrefixedUrls = function () {
        var urlPrefixedRouteConfig = this.addUrlPrefixToAllRoutes(this.currentRouteConfig);
        this.router.resetConfig(urlPrefixedRouteConfig);
        this.router.initialNavigation();
    };
    AppComponent.prototype.addUrlPrefixToAllRoutes = function (currentRouteConfig) {
        var _this = this;
        currentRouteConfig.forEach(function (route) {
            if (_this.appData.urlPrefix) {
                route.path = route.path !== '' ? _this.appData.urlPrefix + '/' + route.path : _this.appData.urlPrefix;
            }
        });
        return currentRouteConfig;
    };
    AppComponent.prototype.toggleNavigation = function () {
        this.showNavigation = !this.showNavigation;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-app',
            template: "\n        <div class=\"top-nav-bar\">\n            <div class=\"app-title\">\n                <a routerLink=\"/\" [innerHTML]=\"config.title || 'UI-jar <span>@</span>'\"></a>\n            </div>\n            <button class=\"nav-burger-btn\" (click)=\"toggleNavigation()\">\n                <span>-</span>\n                <span>-</span>\n                <span>-</span>\n            </button>\n            <a\n                [href]=\"config.project ? config.project.repository : '//github.com/ui-jar/ui-jar'\"\n                target=\"_blank\"\n                class=\"project-link\"\n                [innerHTML]=\"config.project?.repositoryTitle || 'GitHub'\"></a>\n        </div>\n        <section>\n            <nav [class.is-visible]=\"showNavigation\">\n                <ul>\n                    <ng-container *ngFor=\"let linkGroup of navigationLinks\">\n                        <li class=\"groupName\">{{linkGroup.groupName}}</li>\n                        <li *ngFor=\"let link of linkGroup.links\">\n                            <a [routerLink]=\"link.path\">{{link.title}}</a>\n                        </li>\n                    </ng-container>\n                </ul>\n            </nav>\n            <main>\n                <router-outlet></router-outlet>\n            </main>\n        </section>\n    ",
            styles: ["\n        main {\n            position: absolute;\n            top: 50px;\n            bottom: 0;\n            left: 300px;\n            width: calc(100% - 300px);\n            overflow-y: scroll;\n        }\n\n        nav {\n            position: absolute;\n            top: 50px;\n            bottom: 0;\n            width: 300px;\n            overflow-y: scroll;\n            background-color: var(--main-background);\n            box-shadow: 0 0 8px #505050;\n            font-family: Arial;\n            font-size: 14px;\n            transition: transform 250ms ease;\n            will-change: transform;\n        }\n\n        ul {\n            list-style-type: none;\n            margin: 0;\n            padding: 0;\n        }\n\n        ul > li > a {\n            display: block;\n            padding: 8px 20px;\n            text-decoration: none;\n            color: var(--menu-item-color);\n            border-bottom: 1px var(--border-color) solid;\n        }\n\n        ul > li > a:hover {\n            background: var(--menu-item-background-hover);\n        }\n\n        ul .groupName {\n            padding: 7px 10px;\n            background-color: var(--items-header-background);\n            color: var(--items-header-color);\n            font-weight: bold;\n            font-size: 10px;\n            text-transform: uppercase;\n            letter-spacing: 1px;\n        }\n\n        .top-nav-bar {\n            position: relative;\n            z-index: 1000;\n            background-color: var(--accent-color);\n            box-shadow: 0 1px 5px #0d344a;\n            height: 50px;\n        }\n\n        .top-nav-bar .project-link {\n            position: absolute;\n            display: block;\n            top: 8px;\n            right: 10px;\n            padding: 3px 3px 3px 40px;\n            line-height: 30px;\n            text-decoration: none;\n            color: #fff;\n            font-family: Arial;\n            width: 100px;\n            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERCMUIwOUY4NkNFMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERCMUIwOUU4NkNFMTFFM0FBNTJFRTMzNTJEMUJDNDYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1MTc4QTJBOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1MTc4QTJCOTlBMDExRTI5QTE1QkMxMDQ2QTg5MDREIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+jUqS1wAAApVJREFUeNq0l89rE1EQx3e3gVJoSPzZeNEWPKgHoa0HBak0iHiy/4C3WvDmoZ56qJ7txVsPQu8qlqqHIhRKJZceesmhioQEfxTEtsoSpdJg1u/ABJ7Pmc1m8zLwgWTmzcw3L+/te+tHUeQltONgCkyCi2AEDHLsJ6iBMlgHL8FeoqokoA2j4CloRMmtwTmj7erHBXPgCWhG6a3JNXKdCiDl1cidVbXZkJoXQRi5t5BrxwoY71FzU8S4JuAIqFkJ2+BFSlEh525b/hr3+k/AklDkNsf6wTT4yv46KIMNpsy+iMdMc47HNWxbsgVcUn7FmLAzzoFAWDsBx+wVP6bUpp5ewI+DOeUx0Wd9D8F70BTGNjkWtqnhmT1JQAHcUgZd8Lo3rQb1LAT8eJVUfgGvHQigGp+V2Z0iAUUl8QH47kAA1XioxIo+bRN8OG8F/oBjwv+Z1nJgX5jpdzQDw0LCjsPmrcW7I/iHScCAEDj03FtD8A0EyuChHgg4KTlJQF3wZ7WELppnBX+dBFSVpJsOBWi1qiRgSwnOgoyD5hmuJdkWCVhTgnTvW3AgYIFrSbZGh0UW/Io5Vp+DQoK7o80pztWMemZbgxeNwCNwDbw1fIfgGZjhU6xPaJgBV8BdsMw5cbZoHsenwYFxkZzl83xTSKTiviCAfCsJLysH3POfC8m8NegyGAGfLP/VmGmfSChgXroR0RSWjEFv2J/nG84cuKFMf4sTCZqXuJd4KaXFVjEG3+tw4eXbNK/YC9oXXs3O8NY8y99L4BXY5cvLY/Bb2VZ58EOJVcB18DHJq9lRsKr8inyKGVjlmh29mtHs3AHfuhCwy1vXT/Nu2GKQt+UHsGdctyX6eQyNvc+5sfX9Dl7Pe2J/BRgAl2CpwmrsHR0AAAAASUVORK5CYII=') top 3px left 3px no-repeat;\n        }\n\n        .top-nav-bar .project-link:hover {\n            background-color: var(--accent-color);\n        }\n\n        .top-nav-bar .app-title {\n            margin-left: 10px;\n            line-height: 50px;\n            color: #e8f7ff;\n            font-size: 16px;\n            font-family: Verdana;\n            font-weight: bold;\n            text-transform: uppercase;\n        }\n\n        .top-nav-bar .app-title a {\n            text-decoration: none;\n            color: #e8f7ff;\n        }\n\n        .top-nav-bar .app-title span {\n            font-size: 10px;\n        }\n\n        .nav-burger-btn {\n            display: none;\n            width: 50px;\n            height: 40px;\n            position: absolute;\n            top: 5px;\n            left: 5px;\n            padding: 5px 10px;\n            background: none;\n            border: none;\n            outline: none;\n            cursor: pointer;\n            text-indent: -9999px;\n            -webkit-tap-highlight-color: transparent;\n        }\n\n        .nav-burger-btn > span {\n            display: block;\n            height: 3px;\n            width: 100%;\n            background-color: #c9e4f3;\n            margin-bottom: 6px;\n        }\n\n        .nav-burger-btn > span:first-child {\n            margin-top: 5px;\n        }\n\n        .nav-burger-btn:active > span {\n            background-color: #e8f7ff;\n        }\n\n        @media (max-width: 767px) {\n            main {\n                width: 100%;\n                left: auto;\n            }\n\n            nav {\n                position: fixed;\n                top: 50px;\n                bottom: 0;\n                z-index: 900;\n                transform: translateX(-100%);\n            }\n\n            nav.is-visible {\n                transform: translateX(0);\n            }\n\n            .top-nav-bar .app-title {\n                display: none;\n            }\n\n            .top-nav-bar .nav-burger-btn {\n                display: block;\n            }\n        }\n    "]
        }),
        __param(0, core_1.Inject('AppConfig')),
        __param(1, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [Object, Object, router_1.Router])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;

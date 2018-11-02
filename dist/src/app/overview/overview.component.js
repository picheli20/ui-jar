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
var OverviewComponent = (function () {
    function OverviewComponent(router, activatedRoute, appData) {
        this.router = router;
        this.activatedRoute = activatedRoute;
        this.appData = appData;
    }
    OverviewComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.routerSub = this.router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationEnd) {
                _this.createView();
            }
        });
        this.createView();
    };
    OverviewComponent.prototype.ngOnDestroy = function () {
        this.routerSub.unsubscribe();
    };
    OverviewComponent.prototype.createView = function () {
        this.description = this.appData.components[this.getCurrentComponentName()].description;
    };
    OverviewComponent.prototype.getCurrentComponentName = function () {
        var lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length - 1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    };
    OverviewComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-overview',
            template: "\n        <ui-jar-examples></ui-jar-examples>\n        <div class=\"description-container\">\n            <div *ngIf=\"description; else notAvailable\" [innerHTML]=\"description\"></div>\n            <ng-template #notAvailable>\n                <div>\n                    <p>No description is available...</p>\n                </div>\n            </ng-template>\n        </div>\n    ",
            styles: ["\n        :host {\n            display: -webkit-flex;\n            display: flex;\n            -webkit-flex-direction: column;\n            flex-direction: column;\n        \n            font-family: Arial;\n            font-size: 14px;\n        }\n\n        .description-container {\n            margin-top: 30px;\n        }\n    "]
        }),
        __param(2, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [router_1.Router,
            router_1.ActivatedRoute, Object])
    ], OverviewComponent);
    return OverviewComponent;
}());
exports.OverviewComponent = OverviewComponent;

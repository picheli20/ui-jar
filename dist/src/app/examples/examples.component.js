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
var ExamplesComponent = (function () {
    function ExamplesComponent(activatedRoute, router, appData) {
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.appData = appData;
        this.examples = [];
    }
    ExamplesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.routerSub = this.router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationEnd) {
                _this.createExamples();
            }
        });
        this.createExamples();
    };
    ExamplesComponent.prototype.ngOnDestroy = function () {
        if (this.routerSub) {
            this.routerSub.unsubscribe();
        }
    };
    ExamplesComponent.prototype.createExamples = function () {
        var componentName = this.getCurrentComponentName();
        this.examples = this.getComponentExamples(componentName);
    };
    ExamplesComponent.prototype.getComponentExamples = function (componentKey) {
        var moduleDependencyName = this.appData.components[decodeURI(componentKey)].moduleDependencies[0];
        return this.appData.examples[moduleDependencyName];
    };
    ExamplesComponent.prototype.getCurrentComponentName = function () {
        var lastUrlSegmentIndex = this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url.length - 1;
        return this.activatedRoute.snapshot.pathFromRoot[0].firstChild.url[lastUrlSegmentIndex].path;
    };
    ExamplesComponent = __decorate([
        core_1.Component({
            selector: 'ui-jar-examples',
            template: "\n        <ng-container *ngFor=\"let example of examples\">\n            <ui-jar-example-item [example]=\"example\"></ui-jar-example-item>\n        </ng-container>\n    "
        }),
        __param(2, core_1.Inject('AppData')),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            router_1.Router, Object])
    ], ExamplesComponent);
    return ExamplesComponent;
}());
exports.ExamplesComponent = ExamplesComponent;

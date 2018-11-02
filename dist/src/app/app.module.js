import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ContainerComponent } from './container/container.component';
import { AppComponent } from './app.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { OverviewComponent } from './overview/overview.component';
import { ApiComponent } from './api/api.component';
import { ExamplesModule } from './examples/examples.module';
var generatedOutput = require('../../../temp/__ui-jar-temp');
var UIJarModule = (function () {
    function UIJarModule() {
    }
    return UIJarModule;
}());
export { UIJarModule };
UIJarModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    BrowserModule,
                    BrowserAnimationsModule,
                    ExamplesModule,
                    RouterModule.forRoot([
                        { path: '', component: IntroductionComponent },
                        {
                            path: ':component',
                            component: ContainerComponent,
                            children: [
                                {
                                    path: '',
                                    pathMatch: 'full',
                                    redirectTo: 'overview'
                                },
                                {
                                    path: 'overview',
                                    component: OverviewComponent
                                },
                                {
                                    path: 'api',
                                    component: ApiComponent
                                }
                            ]
                        }
                    ], { initialNavigation: false })
                ],
                declarations: [
                    ContainerComponent,
                    AppComponent,
                    IntroductionComponent,
                    OverviewComponent,
                    ApiComponent
                ],
                bootstrap: [
                    AppComponent
                ],
                providers: [
                    { provide: 'AppData', useFactory: generatedOutput.getAppData }
                ]
            },] },
];
UIJarModule.ctorParameters = function () { return []; };

import { OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppData } from '../app.model';
import { ExampleProperties } from './example-item/example-item.component';
export declare class ExamplesComponent implements OnInit, OnDestroy {
    private activatedRoute;
    private router;
    private appData;
    examples: ExampleProperties[];
    private routerSub;
    constructor(activatedRoute: ActivatedRoute, router: Router, appData: AppData);
    ngOnInit(): void;
    ngOnDestroy(): void;
    createExamples(): void;
    private getComponentExamples;
    private getCurrentComponentName;
}

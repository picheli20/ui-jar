import { OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppData } from '../app.model';
export declare class OverviewComponent implements OnInit, OnDestroy {
    private router;
    private activatedRoute;
    private appData;
    description: string;
    routerSub: Subscription;
    constructor(router: Router, activatedRoute: ActivatedRoute, appData: AppData);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private createView;
    private getCurrentComponentName;
}

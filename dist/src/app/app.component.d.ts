import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from './app-config.interface';
import { AppData, NavigationLinks } from './app.model';
export declare class AppComponent implements OnInit, OnDestroy {
    config: AppConfig;
    private appData;
    private router;
    navigationLinks: NavigationLinks[];
    showNavigation: boolean;
    routerEventSubscription: Subscription;
    constructor(config: AppConfig, appData: AppData, router: Router);
    ngOnInit(): void;
    ngOnDestroy(): void;
    readonly currentRouteConfig: any[];
    private resetRouteConfigWithPrefixedUrls;
    private addUrlPrefixToAllRoutes;
    toggleNavigation(): void;
}

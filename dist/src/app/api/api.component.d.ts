import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppData } from '../app.model';
export declare class ApiComponent implements OnInit {
    private activatedRoute;
    private appData;
    api: any;
    constructor(activatedRoute: ActivatedRoute, appData: AppData);
    ngOnInit(): void;
    private createView;
    private getCurrentComponentName;
}

import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppData } from '../app.model';
export declare class ContainerComponent {
    private router;
    private activatedRoute;
    private appData;
    title: string;
    sourceFilePath: string;
    routerSub: Subscription;
    constructor(router: Router, activatedRoute: ActivatedRoute, appData: AppData);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private createView;
    private getCurrentComponentName;
}

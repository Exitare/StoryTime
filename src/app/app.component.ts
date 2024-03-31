import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsService} from "../core/services/settings.service";
import {SentencesService} from "../core/services/sentence.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
    subscriptions$: Subscription[] = [];

    constructor(private settingsService: SettingsService, private sentenceService: SentencesService) {

    }

    async ngOnInit() {
        if (await this.settingsService.isFirstStart()) {
            this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => {
                this.settingsService.saveCategories(categories);
                this.settingsService.setFirstStart();
            }));
        }

    }

    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

}

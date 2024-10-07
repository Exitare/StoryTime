import {Component, OnDestroy, OnInit} from '@angular/core';
import {SettingsService} from "../core/services/settings.service";
import {SentencesService} from "../core/services/sentence.service";
import {Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
    subscriptions$: Subscription[] = [];

    constructor(private settingsService: SettingsService, private sentenceService: SentencesService,
                private translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');

    }

    async ngOnInit() {
        if (await this.settingsService.isFirstStart()) {
            await this.settingsService.initializeSettings();
            this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe(async (categories) => {
                await this.settingsService.saveCategories(categories);
                await this.settingsService.setFirstStart();
            }));
        } else {
            await this.settingsService.updateSettings();
            const language = await this.settingsService.getLanguage();
            this.translate.use(language);
        }

    }

    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

}

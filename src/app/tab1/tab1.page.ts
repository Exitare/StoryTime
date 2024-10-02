import {Component, isDevMode, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {IAge, ISentence} from "../../core/models";
import {SettingsService} from "../../core/services/settings.service";
import {Subscription} from "rxjs";
import {TextToSpeech} from '@capacitor-community/text-to-speech';
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    selectedSentence: ISentence = null!;
    userAge: number = 0;
    categories: string[] = [];
    userCategories: string[] = [];
    language: string = 'en';

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService,
                private translateService: TranslateService) {
        this.subscriptions$.push(this.settingsService.selectedCategoriesChanged$.subscribe(async (selectedCategories: string[]) => {
            this.userCategories = selectedCategories;
            this.selectNewSentence();
        }));

        this.subscriptions$.push(this.settingsService.enteredAgeChanged$.subscribe(async (age: number) => {
            this.userAge = age;
            this.selectNewSentence();
        }));

        this.translateService.onLangChange.subscribe((langEvent) => {
            this.language = langEvent.lang;
        });
    }

    async ngOnInit() {
        await this.loadSettings();
        this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.categories = categories;
        });

        this.language = this.translateService.currentLang;
    }

    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    async loadSettings() {
        this.userAge = await this.settingsService.getAge();
        this.userCategories = await this.settingsService.getCategories();
        this.selectNewSentence();
    }

    selectNewSentence() {
        const targetAge: IAge = {
            min: this.userAge - 1,
            max: this.userAge + 1
        }
        if (this.userAge == 0) {
            targetAge.min = 0;
            targetAge.max = 99;
        } else {
            targetAge.min = this.userAge - 1;
            targetAge.max = this.userAge + 1;
        }

        if (isDevMode()) {
            console.log("Selected age", targetAge);
            console.log("Selected categories", this.userCategories);
        }

        this.sentenceService.getRandomSentence(targetAge, this.userCategories).subscribe((sentence: ISentence) => {
            if (isDevMode())
                console.log("Selected sentence", sentence);
            this.selectedSentence = sentence;
        });
    }

    async textToSpeech(event: any) {
        event.stopPropagation();

        if (!await TextToSpeech.isLanguageSupported({lang: this.language})) {
            await TextToSpeech.speak({
                text: "Sorry, the selected language is not supported by the text to speech engine.",
                lang: 'en',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
            });
            return;
        }

        try {
            // prevent other button clicks
            await TextToSpeech.speak({
                text: this.selectedSentence.sentence,
                lang: this.language,
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
            });
        } catch (e) {
            console.error("Error while trying to speak", e);
        }


    }

}

import {Component, isDevMode, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Age, Sentence} from "../../core/models";
import {SettingsService} from "../../core/services/settings.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    selectedSentence: Sentence = null!;
    userAge: number = 0;
    categories: string[] = [];
    userCategories: string[] = [];

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService) {
        this.subscriptions$.push(this.settingsService.selectedCategoriesChanged$.subscribe(async (selectedCategories: string[]) => {
            this.userCategories = selectedCategories;
            this.selectNewSentence();
        }));

        this.subscriptions$.push(this.settingsService.enteredAgeChanged$.subscribe(async (age: number) => {
            this.userAge = age;
            this.selectNewSentence();
        }));
    }

    async ngOnInit() {
        await this.loadSettings();
        this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.categories = categories;
        });
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
        const targetAge: Age = {
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

        this.sentenceService.getRandomSentence(targetAge, this.userCategories).subscribe((sentence: Sentence) => {
            if (isDevMode())
                console.log("Selected sentence", sentence);
            this.selectedSentence = sentence;
        });
    }

}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";
import {Age, Sentence} from "../../core/models";
import {SettingsService} from "../../core/services/settings.service";


interface ISentenceForCategory {
    category: string;
    sentence: Sentence;
}


@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    availableCategories: string[] = [];
    sentenceForCategory: ISentenceForCategory[] = [];
    colors: string[] = []

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService) {
        this.subscriptions$.push(this.settingsService.enteredAgeChanged$.subscribe(async () => {
            await this.loadData();
        }));
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => this.availableCategories = categories));
    }

    async ngOnInit() {
        await this.loadData();
    }

    async ionViewDidEnter() {
        if (this.sentenceForCategory.length === 0) {
            await this.loadData();
        }
    }


    async loadData() {
        const userAge = await this.settingsService.getAge();

        this.colors = this.availableCategories.map(() => this.getRandomColor());
        // load a sentence for each category
        this.availableCategories.forEach((category) => {
            let age: Age = {
                min: userAge - 1,
                max: userAge + 1
            }
            if (userAge == 0) {
                age = {
                    min: 0,
                    max: 99
                }
            }
            this.subscriptions$.push(this.sentenceService.getRandomSentence(age, [category]).subscribe((sentence) => {
                this.sentenceForCategory.push({category, sentence});
            }));
        });
    }


    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        // only accept darker colors
        for (let i = 0; i < 3; i++) {
            color += letters[Math.floor(Math.random() * 10)];
        }
        return color;
    }


}

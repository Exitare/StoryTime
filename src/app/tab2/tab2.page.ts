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
    userAge: number = 0;
    userCategories: string[] = [];

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService) {
    }

    ngOnInit() {
    }

    async ionViewDidEnter() {
        if (this.sentenceForCategory.length === 0) {
            await this.loadData();
        }
    }


    async loadData() {
        this.userAge = await this.settingsService.getAge();
        this.userCategories = await this.settingsService.getCategories();

        this.colors = this.userCategories.map(() => this.getRandomColor());
        // load a sentence for each category
        this.userCategories.forEach((category) => {
            let age: Age = {
                min: this.userAge - 1,
                max: this.userAge + 1
            }
            if (this.userAge == 0) {
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

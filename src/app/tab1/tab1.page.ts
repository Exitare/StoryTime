import {Component, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Age, Sentence} from "../../core/models";
import {SettingsService} from "../../core/services/settings.service";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

    selectedSentence: Sentence = null!;
    userAge: number = 0;
    categories: string[] = [];
    userCategories: string[] = [];

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService) {

    }

    async ngOnInit() {
        await this.loadSettings();
        this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.categories = categories;
        });
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

        this.sentenceService.getRandomSentence(targetAge, this.userCategories).subscribe((sentence: Sentence) => {
            this.selectedSentence = sentence;
        });
    }

}

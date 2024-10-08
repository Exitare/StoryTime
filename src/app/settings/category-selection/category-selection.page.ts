import {ChangeDetectorRef, Component, isDevMode, OnInit} from '@angular/core';
import {SettingsService} from "../../../core/services/settings.service";
import {SentencesService} from "../../../core/services/sentence.service";
import {firstValueFrom, Subscription} from "rxjs";

@Component({
    selector: 'app-category-selection',
    templateUrl: './category-selection.page.html',
    styleUrls: ['./category-selection.page.scss'],
})
export class CategorySelectionPage implements OnInit {
    userSelectedCategories: string[] = [];
    availableCategories: string[] = [];
    loading = true;

    constructor(private settingsService: SettingsService, private sentenceService: SentencesService,
                private changeDetector: ChangeDetectorRef) {

    }

    async ngOnInit() {
        await this.loadAvailableCategories();
        this.userSelectedCategories = await this.settingsService.getCategories();
        this.loading = false;
        this.changeDetector.detectChanges();
    }

    async loadAvailableCategories() {
        try {
            this.availableCategories = await firstValueFrom(this.sentenceService.loadAvailableCategories());
            // sort the categories alphabetically
            this.availableCategories.sort();
        } catch (error) {
            console.error('Error loading available categories:', error);
        }
    }

    async selectCategory(category: string) {
        // add category to the list
        this.userSelectedCategories.push(category);
        await this.settingsService.saveCategories(this.userSelectedCategories);

        if (isDevMode())
            console.log(this.userSelectedCategories)
        this.changeDetector.detectChanges();
    }

    async deselectCategory(category: string) {
        // remove category from the list
        this.userSelectedCategories = this.userSelectedCategories.filter((c) => c !== category);
        await this.settingsService.saveCategories(this.userSelectedCategories);
        this.changeDetector.detectChanges();
    }

    async resetCategories() {
        this.userSelectedCategories = this.availableCategories;
        await this.settingsService.saveCategories(this.userSelectedCategories);
    }


}

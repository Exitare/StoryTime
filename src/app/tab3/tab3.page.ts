import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../core/services/settings.service";
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";


interface IAgeForm {
    age: FormControl<number>;
}


@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    ageForm: FormGroup<IAgeForm> = null!;
    userSelectedCategories: string[] = [];
    availableCategories: string[] = [];
    availableLanguages: string[] = ['en', 'de', 'gr'];
    userSelectedLanguage: string = 'en';

    constructor(private settingsService: SettingsService, private sentenceService: SentencesService, private changeDetector: ChangeDetectorRef,
                private translateService: TranslateService) {
        this.createForm().then((form) => {
            this.ageForm = form;
            this.ageForm.valueChanges.subscribe(async (value) => {
                await this.settingsService.saveAge(value.age!);
            });
        });

        this.loadAvailableCategories();


    }

    async ngOnInit() {
        await this.loadUserCategories();
        await this.loadUserLanguage();
    }

    ionViewDidEnter() {

    }

    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    async createForm(): Promise<FormGroup<IAgeForm>> {
        const age = await this.settingsService.getAge();
        return new FormGroup<IAgeForm>(<IAgeForm>{
            age: new FormControl<number>(age,
                [
                    Validators.required,
                    Validators.min(0),
                    Validators.max(99)
                ])
        });
    }

    get age(): FormControl<number> {
        return this.ageForm.get('age') as FormControl<number>;
    }

    async loadUserCategories() {
        this.userSelectedCategories = await this.settingsService.getCategories();
    }

    async loadUserLanguage() {
        this.userSelectedLanguage = await this.settingsService.getLanguage();
    }

    loadAvailableCategories() {
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.availableCategories = categories;
        }));
    }

    async resetCategories() {
        this.userSelectedCategories = this.availableCategories;
        await this.settingsService.saveCategories(this.userSelectedCategories);
    }

    async selectCategory(category: string) {
        // add category to the list
        this.userSelectedCategories.push(category);
        await this.settingsService.saveCategories(this.userSelectedCategories);
        console.log(this.userSelectedCategories)
        this.changeDetector.detectChanges();
    }

    async deselectCategory(category: string) {
        // remove category from the list
        this.userSelectedCategories = this.userSelectedCategories.filter((c) => c !== category);
        await this.settingsService.saveCategories(this.userSelectedCategories);
        this.changeDetector.detectChanges();
    }

    async userLanguageChanged(language: string) {
        await this.settingsService.saveLanguage(language);
        this.userSelectedLanguage = language;
        this.translateService.use(language);
        console.log(language);
    }
}

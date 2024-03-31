import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../core/services/settings.service";
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";


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

    constructor(private settingsService: SettingsService, private sentenceService: SentencesService) {
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
        console.log(this.userSelectedCategories);
    }

    loadAvailableCategories() {
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.availableCategories = categories;
        }));
    }

    async handleCategoryChange(event: CustomEvent) {
        // create a string list from event data
        this.userSelectedCategories = Array.from(event.detail.value);
        await this.settingsService.saveCategories(this.userSelectedCategories);
    }
}

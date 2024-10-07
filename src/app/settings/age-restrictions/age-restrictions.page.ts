import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../../core/services/settings.service";


interface IAgeForm {
    age: FormControl<number>;
}


@Component({
    selector: 'app-age-restrictions',
    templateUrl: './age-restrictions.page.html',
    styleUrls: ['./age-restrictions.page.scss'],
})
export class AgeRestrictionsPage implements OnInit {

    ageForm: FormGroup<IAgeForm> = null!;
    ageRestrictionToggler = false;

    constructor(private settingsService: SettingsService) {

        this.createForm().then((form) => {
            this.ageForm = form;
            this.ageForm.valueChanges.subscribe(async (value) => {
                if (this.ageForm.invalid) {
                    return;
                }

                await this.settingsService.saveAgeRestrictionAge(value.age!);
                this.settingsService.ageRestrictionAgeChanged$.next(value.age!);
            });
        });
    }

    async ngOnInit() {
        await this.loadUserAgeRestriction();
    }

    async createForm(): Promise<FormGroup<IAgeForm>> {
        const age: number = await this.settingsService.getAgeRestrictionAge();
        return new FormGroup<IAgeForm>(<IAgeForm>{
            age: new FormControl<number>(age,
                [
                    Validators.required,
                    Validators.min(1),
                    Validators.max(99)
                ])
        });
    }

    async loadUserAgeRestriction() {
        const active = await this.settingsService.isAgeRestrictionActive();
        if (active)
            this.ageRestrictionToggler = true;
    }

    get age(): FormControl<number> {
        if (this.ageRestrictionToggler)
            return this.ageForm.get('age') as FormControl<number>;
        return new FormControl<number>(0) as FormControl<number>;
    }

    async toggleAgeRestriction(event: any) {
        if (event.detail.checked) {
            this.ageRestrictionToggler = true;
            await this.settingsService.activateAgeRestrictions(true);
            return;
        }

        this.ageRestrictionToggler = false;
        await this.settingsService.activateAgeRestrictions(false);
    }

}

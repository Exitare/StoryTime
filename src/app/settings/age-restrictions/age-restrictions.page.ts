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
    }

    async ngOnInit() {
        const age: number = await this.loadUserAgeRestriction();
        this.ageForm = await this.createForm(age);
        await this.subscribeToFormChanges();
    }

    async createForm(age: number): Promise<FormGroup<IAgeForm>> {
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
        return await this.settingsService.getAgeRestrictionAge();
    }

    async subscribeToFormChanges() {
        this.ageForm.valueChanges.subscribe(async (value) => {
            if (this.ageForm.invalid)
                return;

            await this.settingsService.saveAgeRestrictionAge(value.age!);
        });
    }

    get age(): FormControl<number> {
        return this.ageForm.get('age') as FormControl<number>;
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

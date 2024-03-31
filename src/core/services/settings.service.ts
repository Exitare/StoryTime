import {Injectable} from "@angular/core";
import {Preferences} from '@capacitor/preferences';
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    selectedCategoriesChanged$: Subject<string[]> = new Subject<string[]>();
    enteredAgeChanged$: Subject<number> = new Subject<number>();

    constructor() {

    }

    async saveAge(age: number) {
        this.enteredAgeChanged$.next(age);
        await this.set('age', age);
    }

    async getAge() {
        return await this.get('age').then((age) => {
            return Number(age.value) ?? 0;
        });
    }

    async saveCategories(categories: string[]) {
        this.selectedCategoriesChanged$.next(categories);
        await this.set('categories', JSON.stringify(categories));
    }

    async getCategories(): Promise<string[]> {
        const result = await this.get('categories')
        if (result.value) {
            return JSON.parse(result.value);
        }
        return [];
    }

    private async set(key: string, value: any) {
        await Preferences.set({
            key: key,
            value: value,
        });
    }

// JSON "get" example
    async get(key: string) {
        return await Preferences.get({key: key});
    }

}

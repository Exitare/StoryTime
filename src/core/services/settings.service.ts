import {Injectable} from "@angular/core";
import {Preferences} from '@capacitor/preferences';
import {Subject} from "rxjs";


export enum SettingsKeys {
    AGE_RESTRICTION = 'age_restriction',
    AGE = 'age',
    CATEGORIES = 'categories',
    LANGUAGE = 'language',
    DAILY_NOTIFICATION_TIME = 'dailyNotificationTime',
    DAILY_NOTIFICATION_ACTIVE = 'dailyNotificationActive',
    DAILY_NOTIFICATION_ID = 'dailyNotificationId',
    FIRST_START = 'firstStart',
}


@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    selectedCategoriesChanged$: Subject<string[]> = new Subject<string[]>();
    enteredAgeChanged$: Subject<number> = new Subject<number>();
    scheduleDailyNotificationTimeChanged$: Subject<number> = new Subject<number>();
    scheduleDailyNotificationActiveChanged$: Subject<boolean> = new Subject<boolean>();

    constructor() {

    }

    async initializeSettings() {
        await this.saveAgeRestriction(false);
        await this.saveLanguage('en');
    }

    async saveAgeRestriction(value: boolean) {
        await this.set(SettingsKeys.AGE_RESTRICTION, JSON.stringify(value));
    }

    async getAgeRestriction() {
        return await this.get(SettingsKeys.AGE_RESTRICTION).then((noAgeRestriction) => {
            if (noAgeRestriction.value) {
                return JSON.parse(noAgeRestriction.value);
            }
            return false;
        });
    }

    async saveLanguage(language: string) {
        await this.set(SettingsKeys.LANGUAGE, language);
    }

    async getLanguage() {
        return await this.get(SettingsKeys.LANGUAGE).then((language) => {
            return language.value ?? 'en';
        });
    }

    async isFirstStart(): Promise<boolean> {
        const result = await this.get(SettingsKeys.FIRST_START);
        return result.value === null;
    }

    async setFirstStart() {
        await this.set(SettingsKeys.FIRST_START, 'false');
    }

    async saveAge(age: number) {
        await this.set(SettingsKeys.AGE, age);
        this.enteredAgeChanged$.next(age);
    }

    async getAge() {
        return await this.get(SettingsKeys.AGE).then((age) => {
            return Number(age.value) ?? 0;
        });
    }

    async saveCategories(categories: string[]) {
        await this.set(SettingsKeys.CATEGORIES, JSON.stringify(categories));
        this.selectedCategoriesChanged$.next(categories);
    }

    async getCategories(): Promise<string[]> {
        const result = await this.get(SettingsKeys.CATEGORIES)
        if (result.value) {
            return JSON.parse(result.value);
        }
        return [];
    }

    async saveDailyNotificationTime(time: number) {
        await this.set(SettingsKeys.DAILY_NOTIFICATION_TIME, time);
    }

    async getDailyNotificationTime(): Promise<number> {
        return await this.get(SettingsKeys.DAILY_NOTIFICATION_TIME).then((time) => {
            return Number(time.value) ?? 9;
        });
    }

    async saveDailyNotificationActive(active: boolean) {
        // convert bool to string
        const activeString = active ? 'true' : 'false';
        await this.set(SettingsKeys.DAILY_NOTIFICATION_ACTIVE, activeString);
    }

    async getDailyNotificationActive() {
        return await this.get(SettingsKeys.DAILY_NOTIFICATION_ACTIVE).then((active) => {
            console.log(active);
            console.log(active.value);
            console.log(Boolean(active.value === 'true'));
            return Boolean(active.value === 'true');
        });
    }

    async saveDailyNotificationId(id: number) {
        await this.set(SettingsKeys.DAILY_NOTIFICATION_ID, id);
    }

    async getDailyNotificationId() {
        return await this.get(SettingsKeys.DAILY_NOTIFICATION_ID).then((id) => {
            return Number(id.value) ?? -1;
        });
    }

    async removeDailyNotificationId() {
        localStorage.removeItem(SettingsKeys.DAILY_NOTIFICATION_ID);
    }

    private async set(key: string, value: any) {
        await Preferences.set({
            key: key,
            value: value,
        });
    }

    async get(key: string) {
        return await Preferences.get({key: key});
    }

}

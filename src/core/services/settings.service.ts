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
    TEXT_TO_SPEECH = 'textToSpeech'
}


@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    selectedCategoriesChanged$: Subject<string[]> = new Subject<string[]>();
    enteredAgeChanged$: Subject<number> = new Subject<number>();
    scheduleDailyNotificationTimeChanged$: Subject<number> = new Subject<number>();
    scheduleDailyNotificationActiveChanged$: Subject<boolean> = new Subject<boolean>();
    textToSpeechChanged$: Subject<boolean> = new Subject<boolean>();

    constructor() {

    }

    async initializeSettings() {
        await this.saveAgeRestriction(false);
        await this.saveLanguage('en');
        await this.activateTextToSpeech(true);
    }

    async updateSettings() {
        // check if text to speech is present in the local storage
        const textToSpeech = await this.get(SettingsKeys.TEXT_TO_SPEECH);
        if (!textToSpeech.value) {
            await this.activateTextToSpeech(true);
        }
    }

    async activateTextToSpeech(active: boolean) {
        this.textToSpeechChanged$.next(active);
        await this.set(SettingsKeys.TEXT_TO_SPEECH, JSON.stringify(active));
    }

    async getTextToSpeech() {
        return await this.get(SettingsKeys.TEXT_TO_SPEECH).then((textToSpeech) => {
            if (textToSpeech.value) {
                return JSON.parse(textToSpeech.value);
            }
            return false;
        });
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
            if (!time.value) {
                return 9;
            }
            return Number(time.value) ?? 9;
        });
    }

    async saveDailyNotificationActive(active: boolean) {
        // convert bool to string
        await this.set(SettingsKeys.DAILY_NOTIFICATION_ACTIVE, JSON.stringify(active));
    }

    async getDailyNotificationActive() {
        return await this.get(SettingsKeys.DAILY_NOTIFICATION_ACTIVE).then((active) => {
            if (active.value) {
                return JSON.parse(active.value);
            }
            return false;
        });
    }

    async saveDailyNotificationId(id: number) {
        await this.set(SettingsKeys.DAILY_NOTIFICATION_ID, id);
    }

    async getDailyNotificationId() {
        return await this.get(SettingsKeys.DAILY_NOTIFICATION_ID).then((id) => {
            if (!id.value) {
                return -1;
            }
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

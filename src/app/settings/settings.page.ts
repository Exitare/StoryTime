import {ChangeDetectorRef, Component, isDevMode, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../core/services/settings.service";
import {SentencesService} from "../../core/services/sentence.service";
import {forkJoin, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {NavController} from "@ionic/angular";
import {LocalNotifications} from '@capacitor/local-notifications';
import {Router} from "@angular/router";
import {DeviceTimeUtils} from "capacitor-24h-time";


@Component({
    selector: 'app-settings',
    templateUrl: 'settings.page.html',
    styleUrls: ['settings.page.scss']
})
export class SettingsPage implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    userSelectedCategories: string[] = [];
    availableCategories: string[] = [];
    availableLanguages: string[] = ['en', 'de', 'gr'];
    userSelectedLanguage: string = 'en';
    ageRestrictionLabel: string = '';
    textToSpeechToggler = false;
    notificationTime: string = '';
    is24Hour = false;


    constructor(private settingsService: SettingsService, private sentenceService: SentencesService, private changeDetector: ChangeDetectorRef,
                private translateService: TranslateService, private navCtrl: NavController) {


        this.translateService.onLangChange.subscribe(async (event) => {
            if (isDevMode())
                console.log("Changed language to: " + event.lang);
            await this.ngOnInit();

        });

        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationTimeChanged$.subscribe(async (time: number) => {
            this.notificationTime = this.formatTime(time);
        }));

        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationActiveChanged$.subscribe(async (active: boolean) => {
            if (!active) {
                this.notificationTime = '';
            }
        }));

        this.subscriptions$.push(this.settingsService.ageRestrictionAgeChanged$.subscribe(async (age: number) => {
            this.ageRestrictionLabel = age.toString();
        }));

        this.subscriptions$.push(this.settingsService.ageRestrictionActiveChanged$.subscribe(async (active: boolean) => {
            console.log("Age restriction active: " + active);
            await this.loadUserAgeRestriction();
        }));
    }

    async ngOnInit() {
        this.is24Hour = await DeviceTimeUtils.is24HourFormat();
        await this.loadAvailableCategories();
        await this.loadUserCategories();
        await this.loadUserLanguage();
        await this.loadUserAgeRestriction();
        await this.loadNotificationTime();
        this.textToSpeechToggler = await this.settingsService.getTextToSpeech();
    }


    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    async loadNotificationTime() {
        // check if local notifications are active
        if (await this.settingsService.getDailyNotificationActive()) {
            this.notificationTime = this.formatTime(await this.settingsService.getDailyNotificationTime());
        }
    }


    async loadUserCategories() {
        this.userSelectedCategories = await this.settingsService.getCategories();
    }

    async loadUserLanguage() {
        this.userSelectedLanguage = await this.settingsService.getLanguage();
    }

    async loadUserAgeRestriction() {
        if (await this.settingsService.isAgeRestrictionActive())
            this.ageRestrictionLabel = (await this.settingsService.getAgeRestrictionAge()).toString();
        else
            this.ageRestrictionLabel = '';

    }

    async loadAvailableCategories() {
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => {
            this.availableCategories = categories;
            // sort the categories alphabetically
            this.availableCategories.sort();
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

    async userLanguageChanged(language: string) {
        await this.settingsService.saveLanguage(language);
        this.userSelectedLanguage = language;
        this.translateService.use(language);
    }

    async toggleTextToSpeech(event: any) {
        if (event.detail.checked) {
            await this.settingsService.activateTextToSpeech(true);
            return;
        }
        await this.settingsService.activateTextToSpeech(false);


    }

    toPrivacy() {
        this.navCtrl.navigateForward('privacy');
    }

    openNotificationsMenu() {
        this.navCtrl.navigateForward('tabs/settings/notifications');
    }

    openAgeMenu() {
        this.navCtrl.navigateForward('tabs/settings/age-restrictions');
    }

    formatTime(hour: number): string {
        if (this.is24Hour) {
            return hour.toString().padStart(2, '0') + ':00';
        } else {
            const suffix = hour >= 12 ? 'PM' : 'AM';
            const adjustedHour = hour % 12 || 12; // Converts 0 to 12 for 12 AM and 12 PM
            return `${adjustedHour} ${suffix}`;
        }
    }
}

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
    userSelectedLanguage: string = 'en';
    ageRestrictionLabel: string = '';
    textToSpeechToggler = false;
    notificationTime: string = '';
    is24Hour = false;


    constructor(private settingsService: SettingsService,
                private translateService: TranslateService, private navCtrl: NavController) {

        this.subscriptions$.push(this.settingsService.selectedCategoriesChanged$.subscribe(async (categories: string[]) => {
            this.userSelectedCategories = categories;
        }));

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

    openLanguageMenu() {
        this.navCtrl.navigateForward('tabs/settings/language-selection');
    }

    openCategoryMenu() {
        this.navCtrl.navigateForward('tabs/settings/category-selection');
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

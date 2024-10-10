import {Component, isDevMode, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, distinct, pipe, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {NavController} from "@ionic/angular";
import {LocalNotifications, PendingLocalNotificationSchema} from '@capacitor/local-notifications';
import {DeviceTimeUtils} from "capacitor-24h-time";
import {DAILY_NOTIFICATION_ID, INotificationChange, NotificationService, SettingsService} from "../../core/services";


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
    isDebugModeActive = false;
    debugModeCounter: number = 0;
    pendingNotifications: PendingLocalNotificationSchema[] = [];

    constructor(private settingsService: SettingsService,
                private translateService: TranslateService, private navCtrl: NavController,
                private notificationsService: NotificationService) {

        this.subscriptions$.push(this.settingsService.selectedCategoriesChanged$.subscribe(async (categories: string[]) => {
            this.userSelectedCategories = categories;
        }));

        this.translateService.onLangChange
            .pipe(
                distinct() // Ensure the event is distinct
            )
            .subscribe(async (event) => {
                if (isDevMode()) {
                    console.log("Changed language to: " + event.lang);
                }
                await this.ngOnInit();
            });


        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationTimeChanged$.subscribe(async (data: INotificationChange) => {
            this.notificationTime = this.formatTime(data.time);

        }));

        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationActiveChanged$.subscribe(async (data: INotificationChange) => {
            if (!data.active) {
                this.notificationTime = '';
            }
        }));

        this.subscriptions$.push(this.settingsService.ageRestrictionAgeChanged$.subscribe(async (age: number) => {
            this.ageRestrictionLabel = age.toString();
        }));

        this.subscriptions$.push(this.settingsService.ageRestrictionActiveChanged$.subscribe(async (active: boolean) => {
            await this.loadUserAgeRestriction();
        }));

        this.notificationsService.notificationCountUpdated$.subscribe(async (count: number) => {
            await this.loadNotificationInformation();
        });
    }

    async ngOnInit() {
        this.isDebugModeActive = await this.settingsService.isDebugModeActive();
        this.textToSpeechToggler = await this.settingsService.getTextToSpeech();
        this.is24Hour = await DeviceTimeUtils.is24HourFormat();
        await this.loadUserLanguage();
        await this.loadUserCategories();
        await this.loadUserAgeRestriction();
        await this.loadNotificationTime();
        await this.loadNotificationInformation();
    }


    async loadNotificationInformation() {
        this.pendingNotifications = [];
        const notifications = await LocalNotifications.getPending();
        // find all notification with the Daily Notification ID
        for (let i = 0; i < notifications.notifications.length; i++) {
            if (notifications.notifications[i].id === DAILY_NOTIFICATION_ID) {
                this.pendingNotifications.push(notifications.notifications[i]);
            }
        }
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

    async activateDebugMode() {
        this.debugModeCounter++;
        if (this.debugModeCounter >= 10) {
            await this.settingsService.activeDebugMode(true);
            this.isDebugModeActive = true;
        }
    }

    async disableDebugMode() {
        await this.settingsService.activeDebugMode(false);
        this.isDebugModeActive = false;
    }

    async clearPendingNotifications() {
        let pending = await LocalNotifications.getPending();
        await LocalNotifications.cancel({notifications: pending.notifications});
        pending = await LocalNotifications.getPending();
        this.pendingNotifications = pending.notifications;
    }
}

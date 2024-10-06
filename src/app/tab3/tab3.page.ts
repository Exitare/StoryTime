import {ChangeDetectorRef, Component, isDevMode, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "../../core/services/settings.service";
import {SentencesService} from "../../core/services/sentence.service";
import {forkJoin, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {NavController} from "@ionic/angular";
import {LocalNotifications} from '@capacitor/local-notifications';


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
    ageRestrictionCheckbox = false;


    constructor(private settingsService: SettingsService, private sentenceService: SentencesService, private changeDetector: ChangeDetectorRef,
                private translateService: TranslateService, private navCtrl: NavController) {
        this.createForm().then((form) => {
            this.ageForm = form;
            this.ageForm.valueChanges.subscribe(async (value) => {
                if (this.ageForm.invalid) {
                    return;
                }

                await this.settingsService.saveAge(value.age!);
            });
        });

        this.translateService.onLangChange.subscribe(async (event) => {
            if (isDevMode())
                console.log("Changed language to: " + event.lang);
            await this.ngOnInit();

        });


    }

    async ngOnInit() {
        await this.loadAvailableCategories();
        await this.loadUserCategories();
        await this.loadUserLanguage();
        await this.loadUserAgeRestriction();
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
                    Validators.min(1),
                    Validators.max(99)
                ])
        });
    }

    get age(): FormControl<number> {
        if (!this.ageRestrictionCheckbox)
            return this.ageForm.get('age') as FormControl<number>;
        return new FormControl<number>(0) as FormControl<number>;
    }

    async loadUserCategories() {
        this.userSelectedCategories = await this.settingsService.getCategories();
    }

    async loadUserLanguage() {
        this.userSelectedLanguage = await this.settingsService.getLanguage();
    }

    async loadUserAgeRestriction() {
        this.ageRestrictionCheckbox = await this.settingsService.getNoAgeRestriction();
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

    async noAgeRestriction(event: any) {
        if (event.detail.checked) {
            this.age.disable();
            this.ageRestrictionCheckbox = true;
            await this.settingsService.saveNoAgeRestriction(true);
            return;
        }

        this.ageRestrictionCheckbox = false;
        await this.settingsService.saveNoAgeRestriction(false);
        this.age.enable();
    }

    async setupDailyNotifications($event: any) {

        if (!$event.detail.checked) {
            await this.cancelScheduledNotification();
            return;
        }

        if ((await LocalNotifications.requestPermissions()).display === 'granted') {
            if (isDevMode())
                console.log('Notification permissions granted.');

            forkJoin({
                title: this.translateService.get('DAILY_STORY_REMINDER'),
                body: this.translateService.get('DAILY_STORY_REMINDER_BODY')
            }).subscribe(async (translations: { title: string, body: string }) => {
                // Destructure the translations object for readability
                const {title, body} = translations;
                await this.scheduleDailyNotifications(title, body);
            });


        } else {
            console.log('Notification permissions denied.');
        }
    }

    async scheduleDailyNotifications(title: string, body: string) {
        const notificationId = Math.floor(Math.random() * 1000);

        // Store the notification ID somewhere (local storage, database, etc.) if you need it later
        localStorage.setItem('dailyNotificationId', notificationId.toString());

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: notificationId, // Use the generated ID
                    schedule: {
                        repeats: true, // Ensure the notification repeats
                        every: 'day',  // Repeat every day
                        at: new Date(new Date().setHours(9, 0, 0)) // Schedule at a specific time (e.g., 9:00 AM daily)
                    },
                    sound: null!,
                    attachments: null!,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    }

    // Method to cancel the scheduled notification
    async cancelScheduledNotification() {
        // Retrieve the stored notification ID
        const notificationId = localStorage.getItem('dailyNotificationId');

        if (notificationId) {
            await LocalNotifications.cancel({
                notifications: [
                    {
                        id: parseInt(notificationId, 10) // Use the stored notification ID to cancel the correct notification
                    }
                ]
            });

            // Optionally, clear the stored ID after cancellation
            localStorage.removeItem('dailyNotificationId');
            if (isDevMode())
                console.log(`Notification with ID ${notificationId} canceled.`);
        } else {
            if (isDevMode())
                console.log("No notification ID found.");
        }
    }

    toPrivacy() {
        this.navCtrl.navigateForward('privacy');
    }
}

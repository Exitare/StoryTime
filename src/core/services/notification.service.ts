// Define a constant notification ID to be reused throughout
import {Injectable, isDevMode} from "@angular/core";
import {LocalNotifications} from "@capacitor/local-notifications";
import {distinct, forkJoin, Subject, Subscription} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {INotificationChange, SettingsService} from "./settings.service";

export const DAILY_NOTIFICATION_ID = 1;

export interface INotificationContent {
    title: string;
    body: string;
}


@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private isInitialized = false; // Add a flag for initialization check
    subscriptions$: Subscription[] = [];
    notificationCountUpdated$: Subject<number> = new Subject<number>();


    constructor(private translateService: TranslateService,
                private settingsService: SettingsService) {

        console.log("NotificationService initialized");


    }

    async initialize() {
        if (this.isInitialized) {
            console.log("NotificationService already initialized");
            return;
        }
        this.isInitialized = true;
        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationTimeChanged$
            .pipe(distinct())
            .subscribe(async (data: INotificationChange) => {
                if (data.active) {
                    await this.cancelDailyScheduledNotification();
                    const content = await this.loadDailyNotificationContent();
                    await this.scheduleDailyNotifications(content.title, content.body, data.time);
                } else {
                    await this.cancelDailyScheduledNotification();
                }
            }));

        this.subscriptions$.push(this.settingsService.scheduleDailyNotificationActiveChanged$
            .pipe(distinct())
            .subscribe(async (data: INotificationChange) => {
                if (data.active) {
                    await this.cancelDailyScheduledNotification();
                    const content = await this.loadDailyNotificationContent();
                    await this.scheduleDailyNotifications(content.title, content.body, data.time);
                } else {
                    await this.cancelDailyScheduledNotification();
                }
            }));

        this.translateService.onLangChange
            .pipe(distinct())
            .subscribe(async (event) => {
                if (isDevMode())
                    console.log("Re-scheduling notification after language change.");

                const notificationActive: boolean = await this.settingsService.getDailyNotificationActive();
                const notificationTime: number = await this.settingsService.getDailyNotificationTime();

                // cancel the current notification and wait for completion
                this.settingsService.scheduleDailyNotificationTimeChanged$.next({
                    active: notificationActive,
                    time: notificationTime
                });
            });
    }


    async scheduleDailyNotifications(title: string, body: string, hour: number) {
        if(isDevMode())
            console.log("Scheduling daily notification at " + hour + " o'clock.");

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: DAILY_NOTIFICATION_ID,  // Ensure a unique ID
                    schedule: {
                        repeats: true,      // Repeat notification
                        on: {hour: hour, minute: 0}  // Schedule at hour every day
                    },
                    sound: null!,           // Optional: No sound
                    attachments: null!,     // Optional: No attachments
                    actionTypeId: "",       // Optional: No action type
                    extra: null             // Optional: No extra data
                }
            ]
        });

        const pending = await LocalNotifications.getPending();
        this.notificationCountUpdated$.next(pending.notifications.length);

    }

    // Method to cancel the scheduled notification
    async cancelDailyScheduledNotification() {
        let pending = await LocalNotifications.getPending();

        for (let i = 0; i < pending.notifications.length; i++) {
            if (pending.notifications[i].id === DAILY_NOTIFICATION_ID) {
                await LocalNotifications.cancel({
                    notifications: [pending.notifications[i]]
                });
            }
        }


        pending = await LocalNotifications.getPending();
        this.notificationCountUpdated$.next(pending.notifications.length);
    }

    async loadDailyNotificationContent(): Promise<INotificationContent> {
        return new Promise((resolve) => {
            forkJoin({
                title: this.translateService.get('LOCAL_NOTIFICATIONS.DAILY_STORY_REMINDER'),
                body: this.translateService.get('LOCAL_NOTIFICATIONS.DAILY_STORY_REMINDER_BODY')
            }).subscribe(async (translations: { title: string, body: string }) => {
                const {title, body} = translations;
                resolve({title, body});
            });
        });
    }
}
import {Component, isDevMode, OnInit} from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";
import {forkJoin} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {DeviceTimeUtils} from "capacitor-24h-time";
import {SettingsService} from "../../../core/services/settings.service";

// Define a constant notification ID to be reused throughout
const NOTIFICATION_ID = 84600999;

interface INotificationContent {
    title: string;
    body: string;
}

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

    notificationActive = false;
    selectedSegment: number = 9;
    is24Hour = false;
    protected readonly isDevMode = isDevMode();

    constructor(private translateService: TranslateService, private settingsService: SettingsService) {

        this.translateService.onLangChange.subscribe(async (event) => {
            if (isDevMode())
                console.log("Re-scheduling notification after language change.");
            // cancel the current notification and wait for completion
            const notificationContent: INotificationContent = await this.loadNotificationContent();
            await this.scheduleDailyNotifications(notificationContent.title, notificationContent.body, this.selectedSegment);
        });
    }

    async ngOnInit() {
        this.selectedSegment = await this.settingsService.getDailyNotificationTime();
        this.notificationActive = await this.settingsService.getDailyNotificationActive();
        this.is24Hour = await this.is24HourFormat();
    }

    async activateDailyNotifications($event: any) {

        if (!$event.detail.checked) {
            await this.cancelScheduledNotification();
            await this.settingsService.saveDailyNotificationActive(false);
            this.notificationActive = false;
            this.settingsService.scheduleDailyNotificationActiveChanged$.next(false);
            return;
        }

        if ((await LocalNotifications.requestPermissions()).display === 'granted') {
            if (isDevMode())
                console.log('Notification permissions granted.');

            await this.settingsService.saveDailyNotificationActive(true);
            this.settingsService.scheduleDailyNotificationActiveChanged$.next(true);
            this.settingsService.scheduleDailyNotificationTimeChanged$.next(this.selectedSegment);
            this.notificationActive = true;
            const notificationContent: INotificationContent = await this.loadNotificationContent();
            await this.scheduleDailyNotifications(notificationContent.title, notificationContent.body, this.selectedSegment);

        } else {
            if (isDevMode())
                console.log('Notification permissions denied.');

            await this.settingsService.saveDailyNotificationActive(false);
            this.notificationActive = false;
            await this.cancelScheduledNotification();
        }
    }

    async scheduleDailyNotifications(title: string, body: string, hour: number) {
        if (isDevMode())
            console.log("Schedule daily notifications");
        // Cancel any pending notifications before scheduling a new one
        await this.cancelScheduledNotification();

        const now = new Date();
        const scheduledTime = new Date();

        // Set the time for the notification
        scheduledTime.setHours(hour, 0, 0, 0);

        // If the scheduled time is before the current time, schedule it for the next day
        if (scheduledTime <= now)
            scheduledTime.setDate(scheduledTime.getDate() + 1); // Move to the next day

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: NOTIFICATION_ID,  // Ensure a unique ID
                    schedule: {
                        at: scheduledTime,  // Schedule at the defined time
                        repeats: true,      // Repeat notification
                        every: 'day'     // Repeat every day
                    },
                    sound: null!,           // Optional: No sound
                    attachments: null!,     // Optional: No attachments
                    actionTypeId: "",       // Optional: No action type
                    extra: null             // Optional: No extra data
                }
            ]
        });

    }

    // Method to cancel the scheduled notification
    async cancelScheduledNotification() {
        const pending = await LocalNotifications.getPending();

        // Check if any pending notifications match the NOTIFICATION_ID
        if (pending.notifications.some(notification => notification.id === NOTIFICATION_ID)) {
            await LocalNotifications.cancel({
                notifications: [
                    {
                        id: NOTIFICATION_ID
                    }
                ]
            });
            if (isDevMode()) {
                console.log(`Notification with ID ${NOTIFICATION_ID} canceled.`);
            }

        }
    }

    async notificationTimeChanged(event: any) {
        // Cancel the current notification and wait for completion
        await this.cancelScheduledNotification();

        if (isDevMode())
            console.log('Notification time changed.');

        if ((await LocalNotifications.requestPermissions()).display !== 'granted') {
            if (isDevMode())
                console.log('Notification permissions denied.');
            return;
        }

        // Save the new notification time
        await this.settingsService.saveDailyNotificationTime(event.detail.value);
        this.settingsService.scheduleDailyNotificationTimeChanged$.next(event.detail.value);

        // Schedule the new notification
        const notificationContent: INotificationContent = await this.loadNotificationContent();
        await this.scheduleDailyNotifications(notificationContent.title, notificationContent.body, event.detail.value);


    }

    async is24HourFormat() {
        return await DeviceTimeUtils.is24HourFormat();
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

    async loadNotificationContent(): Promise<INotificationContent> {
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

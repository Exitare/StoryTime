import {Component, isDevMode, OnInit} from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";
import {forkJoin} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {DeviceTimeUtils} from "capacitor-24h-time";
import {SettingsService} from "../../../core/services/settings.service";

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
            this.notificationActive = true

            forkJoin({
                title: this.translateService.get('DAILY_STORY_REMINDER'),
                body: this.translateService.get('DAILY_STORY_REMINDER_BODY')
            }).subscribe(async (translations: { title: string, body: string }) => {
                // Destructure the translations object for readability
                const {title, body} = translations;
                await this.scheduleDailyNotifications(title, body, 9);
            });


        } else {
            if (isDevMode())
                console.log('Notification permissions denied.');

            await this.settingsService.saveDailyNotificationActive(false);

            this.notificationActive = false;
        }
    }

    async scheduleDailyNotifications(title: string, body: string, hour: number) {
        let notificationId = Math.floor(Math.random() * 1000);
        // add 84600 to the front to avoid conflicts with other notifications
        notificationId = parseInt('84600' + notificationId.toString());


        // Store the notification ID
        await this.settingsService.saveDailyNotificationId(notificationId);

        const now = new Date();
        const scheduledTime = new Date();

        // Set the time for the notification
        scheduledTime.setHours(hour, 0, 0, 0);

        // If the scheduled time is before the current time, schedule it for the next day
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1); // Move to the next day
        }

        // Schedule the notification
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: title,
                    body: body,
                    id: notificationId,
                    schedule: {
                        repeats: true, // Repeat the notification
                        every: 'day',  // Repeat daily
                        at: scheduledTime // Use the adjusted time
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
        const notificationId = await this.settingsService.getDailyNotificationId()

        if (notificationId === -1) {
            if (isDevMode())
                console.log("No notification ID found.");
            return;
        }

        //Get a list of pending notifications.
        const pending = await LocalNotifications.getPending();
        pending.notifications.forEach((notification) => {
            // check if the notification id starts with 84600
            if (notification.id.toString().startsWith('84600')) {

                // Cancel the notification
                LocalNotifications.cancel({
                    notifications: [
                        {
                            id: notification.id
                        }
                    ]
                });

                if (isDevMode())
                    console.log(`Found & canceled notification with ID ${notification.id}.`);
            }
        });


        await LocalNotifications.cancel({
            notifications: [
                {
                    id: notificationId // Use the stored notification ID to cancel the correct notification
                }
            ]
        });

        // Optionally, clear the stored ID after cancellation
        await this.settingsService.removeDailyNotificationId();
        if (isDevMode())
            console.log(`Notification with ID ${notificationId} canceled.`);

    }

    async notificationTimeChanged(event: any) {
        // Cancel the current notification
        await this.cancelScheduledNotification();


        if (isDevMode())
            console.log('Notification time changed.');

        // Save the new notification time
        await this.settingsService.saveDailyNotificationTime(event.detail.value);

        this.settingsService.scheduleDailyNotificationTimeChanged$.next(event.detail.value);

        forkJoin({
            title: this.translateService.get('LOCAL_NOTIFICATIONS.DAILY_STORY_REMINDER'),
            body: this.translateService.get('LOCAL_NOTIFICATIONS.DAILY_STORY_REMINDER_BODY')
        }).subscribe(async (translations: { title: string, body: string }) => {
            // Destructure the translations object for readability
            const {title, body} = translations;
            await this.scheduleDailyNotifications(title, body, event.detail.value);
        });
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

    async resetNotifications() {
        //Get a list of pending notifications.
        const pending = await LocalNotifications.getPending();
        pending.notifications.forEach((notification) => {
            // check if the notification id starts with 84600
            // Cancel the notification
            LocalNotifications.cancel({
                notifications: [
                    {
                        id: notification.id
                    }
                ]
            });

            if (isDevMode())
                console.log(`Found & canceled notification with ID ${notification.id}.`);

        });

    }


}

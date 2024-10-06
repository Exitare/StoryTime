import {Component, isDevMode, OnInit} from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";
import {forkJoin} from "rxjs";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

    notificationActive = localStorage.getItem('dailyNotificationActive') === 'true';
    selectedSegment: string = '9';
    is24Hour = this.is24HourFormat();

    constructor(private translateService: TranslateService) {
    }

    ngOnInit() {
        this.selectedSegment = localStorage.getItem('dailyNotificationTime') || '9';
    }

    async activateDailyNotifications($event: any) {

        if (!$event.detail.checked) {
            await this.cancelScheduledNotification();
            localStorage.setItem('dailyNotificationActive', 'false');
            this.notificationActive = false;
            return;
        }

        if ((await LocalNotifications.requestPermissions()).display === 'granted') {
            if (isDevMode())
                console.log('Notification permissions granted.');

            localStorage.setItem('dailyNotificationActive', 'true');
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
            localStorage.setItem('dailyNotificationActive', 'false');
            this.notificationActive = false;
        }
    }

    async scheduleDailyNotifications(title: string, body: string, hour: any) {
        const notificationId = Math.floor(Math.random() * 1000);

        // Store the notification ID somewhere (local storage, database, etc.) if you need it later
        localStorage.setItem('dailyNotificationId', notificationId.toString());

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

    async notificationTimeChanged(event: any) {
        // Cancel the current notification
        await this.cancelScheduledNotification();


        if (isDevMode())
            console.log('Notification time changed.');

        localStorage.setItem('dailyNotificationTime', event.detail.value);

        forkJoin({
            title: this.translateService.get('DAILY_STORY_REMINDER'),
            body: this.translateService.get('DAILY_STORY_REMINDER_BODY')
        }).subscribe(async (translations: { title: string, body: string }) => {
            // Destructure the translations object for readability
            const {title, body} = translations;
            await this.scheduleDailyNotifications(title, body, event.detail.value);
        });
    }

    is24HourFormat(): boolean {
        const testTime = new Date().toLocaleTimeString();
        // Check if the time string includes AM or PM
        return !testTime.match(/AM|PM/);
    }
}

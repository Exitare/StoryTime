import {Component, isDevMode, OnInit} from '@angular/core';
import {LocalNotifications} from "@capacitor/local-notifications";
import {TranslateService} from "@ngx-translate/core";
import {DeviceTimeUtils} from "capacitor-24h-time";
import {
    SettingsService
} from "../../../core/services";


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

    constructor(private settingsService: SettingsService) {
    }

    async ngOnInit() {
        this.selectedSegment = await this.settingsService.getDailyNotificationTime();
        this.notificationActive = await this.settingsService.getDailyNotificationActive();
        this.is24Hour = await this.is24HourFormat();
    }

    async activateDailyNotifications($event: any) {

        if (!$event.detail.checked) {
            await this.settingsService.saveDailyNotificationActive(false, this.selectedSegment);
            this.notificationActive = false;
            return;
        }

        if ((await LocalNotifications.requestPermissions()).display === 'granted') {
            if (isDevMode())
                console.log('Notification permissions granted.');

            await this.settingsService.saveDailyNotificationActive(true, this.selectedSegment);
            this.notificationActive = true;

        } else {
            if (isDevMode())
                console.log('Notification permissions denied.');

            await this.settingsService.saveDailyNotificationActive(false, this.selectedSegment);
            this.notificationActive = false;
        }
    }


    async notificationTimeChanged(event: any) {
        if ((await LocalNotifications.requestPermissions()).display !== 'granted') {
            if (isDevMode())
                console.log('Notification permissions denied.');
            return;
        }

        // Save the new notification time
        await this.settingsService.saveDailyNotificationTime(this.notificationActive, event.detail.value);
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


}

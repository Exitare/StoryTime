import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SettingsPage} from './settings.page';
import {SettingsPageRoutingModule} from './settings-routing.module';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../core/pipes/pipe.module";
import {NotificationsPage} from "./notifications/notifications.page";
import {AgeRestrictionsPage} from "./age-restrictions/age-restrictions.page";
import {LanguageSelectionPage} from "./language-selection/language-selection.page";
import {CategorySelectionPage} from "./category-selection/category-selection.page";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        SettingsPageRoutingModule,
        ReactiveFormsModule,
        TranslateModule,
        PipeModule
    ],
    declarations: [
        SettingsPage,
        NotificationsPage,
        AgeRestrictionsPage,
        LanguageSelectionPage,
        CategorySelectionPage
    ]
})
export class SettingsPageModule {
}

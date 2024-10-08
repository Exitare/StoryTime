import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsPage} from './settings.page';
import {NotificationsPage} from "./notifications/notifications.page";
import {AgeRestrictionsPage} from "./age-restrictions/age-restrictions.page";
import {LanguageSelectionPage} from "./language-selection/language-selection.page";
import {CategorySelectionPage} from "./category-selection/category-selection.page";

const routes: Routes = [
    {
        path: '',
        component: SettingsPage,
    },
    {
        path: 'notifications',
        component: NotificationsPage
    },
    {
        path: 'age-restrictions',
        component: AgeRestrictionsPage,
    },
    {
        path: 'language-selection',
        component: LanguageSelectionPage,
    },
    {
        path: 'category-selection',
        component: CategorySelectionPage,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SettingsPageRoutingModule {
}

import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient, provideHttpClient} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {PdfViewerModule} from "ng2-pdf-viewer";
import {NotificationService, SentencesService, SettingsService} from "../core/services";

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Function to initialize the service
export function initializeNotificationService(notificationService: NotificationService) {
    return () => notificationService.initialize();
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        PdfViewerModule,
        TranslateModule.forRoot({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeNotificationService,
            deps: [NotificationService],  // Ensure the service is available here
            multi: true,
        },
        provideHttpClient(),
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},

    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivacyPageRoutingModule } from './privacy-routing.module';

import { PrivacyPage } from './privacy.page';
import {PdfViewerModule} from "ng2-pdf-viewer";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PrivacyPageRoutingModule,
        PdfViewerModule
    ],
  declarations: [PrivacyPage]
})
export class PrivacyPageModule {}

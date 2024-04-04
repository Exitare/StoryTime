import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Tab3Page} from './tab3.page';

import {Tab3PageRoutingModule} from './tab3-routing.module';
import {TranslateModule} from "@ngx-translate/core";
import {PipeModule} from "../../core/pipes/pipe.module";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        Tab3PageRoutingModule,
        ReactiveFormsModule,
        TranslateModule,
        PipeModule
    ],
    declarations: [Tab3Page]
})
export class Tab3PageModule {
}

import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ExplorePage} from './explore.page';
import {ExplorePageRoutingModule} from './explore-routing.module';
import {PipeModule} from "../../core/pipes/pipe.module";
import {TranslateModule} from "@ngx-translate/core";
import {ExploreCategoryComponent} from "./explore-category/explore-category.component";

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        ExplorePageRoutingModule,
        PipeModule,
        TranslateModule,
        ReactiveFormsModule,
    ],
    declarations: [ExplorePage, ExploreCategoryComponent]
})
export class ExplorePageModule {
}

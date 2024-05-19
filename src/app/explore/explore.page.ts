import {Component, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";
import {SettingsService} from "../../core/services/settings.service";
import {NavController} from "@ionic/angular";
import {TranslateService} from "@ngx-translate/core";


@Component({
    selector: 'app-explore',
    templateUrl: 'explore.page.html',
    styleUrls: ['explore.page.scss']
})
export class ExplorePage implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    availableCategories: string[] = [];
    colors: string[] = []
    sentenceCountByCategory: any = {};

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService, private navCtrl: NavController
        , private translateService: TranslateService) {
        this.loadData();

        this.translateService.onLangChange.subscribe((event) => {
            this.loadData();
        });

    }

    async ngOnInit() {

    }

    async ionViewDidEnter() {
    }


    async loadData() {
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe(async (categories) => {
            this.availableCategories = categories
            console.log(this.availableCategories);
            this.countSentences();
        }));
    }


    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    countSentences() {
        this.availableCategories.forEach(category => {
            this.subscriptions$.push(this.sentenceService.getSentencesByCategory(category).subscribe((sentences) => {
                this.sentenceCountByCategory[category] = sentences.length;
            }));
        });

    }

    async openCategory(category: string) {
        await this.navCtrl.navigateForward('tabs/explore/category/' + category);
    }

}

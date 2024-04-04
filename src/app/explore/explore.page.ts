import {Component, OnDestroy, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Subscription} from "rxjs";
import {SettingsService} from "../../core/services/settings.service";
import {NavController} from "@ionic/angular";


@Component({
    selector: 'app-explore',
    templateUrl: 'explore.page.html',
    styleUrls: ['explore.page.scss']
})
export class ExplorePage implements OnInit, OnDestroy {
    subscriptions$: Subscription[] = [];
    availableCategories: string[] = [];
    colors: string[] = []

    constructor(private sentenceService: SentencesService, private settingsService: SettingsService, private navCtrl: NavController) {
        this.subscriptions$.push(this.sentenceService.loadAvailableCategories().subscribe((categories) => this.availableCategories = categories));
    }

    async ngOnInit() {
    }

    async ionViewDidEnter() {
    }


    ngOnDestroy() {
        this.subscriptions$.forEach((subscription) => subscription.unsubscribe());
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        // only accept darker colors
        for (let i = 0; i < 3; i++) {
            color += letters[Math.floor(Math.random() * 10)];
        }
        return color;
    }

    async openCategory(category: string) {
        await this.navCtrl.navigateForward('tabs/explore/category/' + category);
    }

}

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ISentence} from "../../../core/models";
import {Subscription} from "rxjs";
import {SentencesService} from "../../../core/services/sentence.service";


interface IColoredSentence {
    sentence: ISentence;
    color: string;

}


@Component({
    selector: 'app-explore-category',
    templateUrl: './explore-category.component.html',
    styleUrls: ['./explore-category.component.scss'],
})
export class ExploreCategoryComponent implements OnInit {
    subscriptions$: Subscription[] = [];
    coloredSentences: IColoredSentence[] = [];
    colors: string[] = [];
    category: string;


    constructor(private route: ActivatedRoute, private navCtrl: NavController, private sentenceService: SentencesService) {
        // get router params
        this.category = this.route.snapshot.paramMap.get('categoryName') ?? '';
        if (!this.category) {
            this.navCtrl.navigateBack('/tabs/explore');
            return;
        }

        this.loadData();

    }

    ngOnInit() {
    }

    async loadData() {
        this.subscriptions$.push(this.sentenceService.getSentencesByCategory(this.category).subscribe((sentence) => {

            this.coloredSentences = sentence.map((sentence) => {
                return {sentence: sentence, color: this.getRandomColor()};
            });
        }));
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

}

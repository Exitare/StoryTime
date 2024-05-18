import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ISentence} from "../../../core/models";
import {Subscription} from "rxjs";
import {SentencesService} from "../../../core/services/sentence.service";




@Component({
    selector: 'app-explore-category',
    templateUrl: './explore-category.component.html',
    styleUrls: ['./explore-category.component.scss'],
})
export class ExploreCategoryComponent implements OnInit {
    subscriptions$: Subscription[] = [];
    sentences: ISentence[] = [];
    colors: string[] = [];
    category: string;
    sentencesGroupedByAge: { age: number, sentences: ISentence[] }[] = [];


    constructor(private route: ActivatedRoute, private navCtrl: NavController, private sentenceService: SentencesService) {
        // get router params
        this.category = this.route.snapshot.paramMap.get('categoryName') ?? '';
        if (!this.category) {
            this.navCtrl.navigateBack('/tabs/explore');
            return;
        }



    }

    async ngOnInit() {
        await this.loadData();
        await this.groupByAge();
    }

    async loadData() {
        return new Promise<void>((resolve, reject) => {
            this.subscriptions$.push(this.sentenceService.getSentencesByCategory(this.category).subscribe((sentences) => {
                this.sentences = sentences;
                resolve();
            }));
        });
    }


    async groupByAge(): Promise<void> {
        this.sentencesGroupedByAge = [];
        for (const sentence of this.sentences) {
            const age = sentence.age;
            const index = this.sentencesGroupedByAge.findIndex((group) => group.age === age);
            if (index === -1) {
                this.sentencesGroupedByAge.push({ age: age, sentences: [sentence] });
            } else {
                this.sentencesGroupedByAge[index].sentences.push(sentence);
            }
        }
        // sort ascending
        this.sentencesGroupedByAge.sort((a, b) => a.age - b.age);
    }

}

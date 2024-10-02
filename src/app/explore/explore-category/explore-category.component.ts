import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NavController} from "@ionic/angular";
import {ISentence} from "../../../core/models";
import {Subscription} from "rxjs";
import {SentencesService} from "../../../core/services/sentence.service";
import {TextToSpeech} from "@capacitor-community/text-to-speech";
import {TranslateService} from "@ngx-translate/core";


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
    language = 'en';


    constructor(private route: ActivatedRoute, private navCtrl: NavController, private sentenceService: SentencesService,
                private translateService: TranslateService) {
        // get router params
        this.category = this.route.snapshot.paramMap.get('categoryName') ?? '';
        if (!this.category) {
            this.navCtrl.navigateBack('/tabs/explore');
            return;
        }

        this.translateService.onLangChange.subscribe((langEvent) => {
            this.language = langEvent.lang;
        });

    }

    async ngOnInit() {
        await this.loadData();
        await this.groupByAge();
        this.language = this.translateService.currentLang;
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
                this.sentencesGroupedByAge.push({age: age, sentences: [sentence]});
            } else {
                this.sentencesGroupedByAge[index].sentences.push(sentence);
            }
        }
        // sort ascending
        this.sentencesGroupedByAge.sort((a, b) => a.age - b.age);
    }

    async textToSpeech(age: number, sentence: number, event: any) {
        event.stopPropagation();


        if (!await TextToSpeech.isLanguageSupported({lang: this.language})) {
            await TextToSpeech.speak({
                text: "Sorry, the selected language is not supported by the text to speech engine.",
                lang: 'en',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
            });
            return;
        }

        const selectedSentence: ISentence = this.sentencesGroupedByAge[age].sentences[sentence];

        try {
            // prevent other button clicks
            await TextToSpeech.speak({
                text: selectedSentence.sentence,
                lang: this.language,
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
            });
        } catch (e) {
            console.error("Error while trying to speak", e);
        }


    }

}

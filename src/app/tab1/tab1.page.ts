import {Component, OnInit} from '@angular/core';
import {SentencesService} from "../../core/services/sentence.service";
import {Age, Sentence} from "../../core/models";

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

    selectedSentence: Sentence = null!;

    constructor(private sentenceService: SentencesService) {
        this.sentenceService.getRandomSentence({min: 1, max: 3} as Age).subscribe((sentence: Sentence) => {
            console.log(sentence);
            this.selectedSentence = sentence;
        });

    }

    ngOnInit() {

    }

}

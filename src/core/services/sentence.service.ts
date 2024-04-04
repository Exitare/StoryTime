// File: sentences.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IAge, ISentence} from "../models";
import {TranslateService} from "@ngx-translate/core";


@Injectable({
    providedIn: 'root',
})
export class SentencesService {
    constructor(private http: HttpClient, private translateService: TranslateService) {
        this.translateService.onLangChange.subscribe((langEvent) => {
            this.sentencesUrl = `../assets/sentences/${langEvent.lang}.json`;
        });
    }

    private sentencesUrl = '../assets/sentences/en.json';


    loadAvailableCategories(): Observable<string[]> {
        return this.http.get<ISentence[]>(this.sentencesUrl).pipe(
            map(sentences => {
                const categories = sentences.map(sentence => sentence.category);
                return [...new Set(categories)];
            })
        );
    }


    getSentencesByCategory(category: string): Observable<ISentence[]> {
        return this.http.get<ISentence[]>(this.sentencesUrl).pipe(
            map(sentences => sentences.filter(sentence => sentence.category === category))
        );
    }

    getRandomSentence(targetAgeRange: IAge, categories?: string[]): Observable<ISentence> {
        return this.http.get<ISentence[]>(this.sentencesUrl).pipe(
            map(sentences => {
                let filteredSentences = sentences;

                if (categories) {
                    // Filter by category
                    filteredSentences = sentences.filter(sentence =>
                        categories.length === 0 || categories.includes(sentence.category));
                }

                // filter by age using the target age range
                filteredSentences = filteredSentences.filter(sentence =>
                    sentence.age >= targetAgeRange.min && sentence.age <= targetAgeRange.max);


                // Return null if no sentences match the criteria
                if (filteredSentences.length === 0) {
                    return {
                        sentence: 'Oops, no sentence found!',
                        category: "Fallback",
                        age: 0
                    } as ISentence;
                }

                // Select a random sentence from the filtered list
                const randomIndex = Math.floor(Math.random() * filteredSentences.length);
                return filteredSentences[randomIndex];
            })
        );
    }
}

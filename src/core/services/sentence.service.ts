// File: sentences.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Age, Sentence} from "../models";
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
        return this.http.get<Sentence[]>(this.sentencesUrl).pipe(
            map(sentences => {
                const categories = sentences.map(sentence => sentence.category);
                return [...new Set(categories)];
            })
        );
    }

    getRandomSentence(targetAgeRange: Age, categories?: string[]): Observable<Sentence> {
        return this.http.get<Sentence[]>(this.sentencesUrl).pipe(
            map(sentences => {
                let filteredSentences = sentences;
                if (categories) {
                    // Filter by category
                    filteredSentences = sentences.filter(sentence =>
                        categories.length === 0 || categories.includes(sentence.category));
                }


                filteredSentences = filteredSentences.filter(sentence =>
                    sentence.age.max >= targetAgeRange.min && sentence.age.min <= targetAgeRange.max
                );


                // Return null if no sentences match the criteria
                if (filteredSentences.length === 0) {
                    return {
                        sentence: 'Oops, no sentence found!',
                        category: "Fallback",
                        age: {
                            min: 0,
                            max: 99,
                        }
                    } as Sentence;
                }

                // Select a random sentence from the filtered list
                const randomIndex = Math.floor(Math.random() * filteredSentences.length);
                return filteredSentences[randomIndex];
            })
        );
    }
}

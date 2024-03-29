// File: sentences.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Age, Sentence} from "../models";


@Injectable({
    providedIn: 'root',
})
export class SentencesService {
    constructor(private http: HttpClient) {
    }

    private sentencesUrl = '../assets/sentences/sentences.json';

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
                        sentence: '',
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

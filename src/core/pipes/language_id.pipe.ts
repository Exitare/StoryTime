import {Pipe, PipeTransform} from "@angular/core";


@Pipe({
    name: 'languageId',
    standalone: true
})
export class LanguageIdPipe implements PipeTransform {
    transform(language: string): string {
        switch(language){
            case 'en':
                return "English";
            case 'de':
                return "Deutsch";
            case 'gr':
                return "Ελληνικά";
            default:
                return "English";
        }
    }
}


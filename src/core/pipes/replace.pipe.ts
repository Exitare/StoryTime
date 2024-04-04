import {Pipe, PipeTransform} from "@angular/core";


@Pipe({
    name: 'replaceCharacter',
    standalone: true
})
export class ReplaceCharacterPipe implements PipeTransform {
    transform(word: string, character: string): string {
        // replace all occurences of character with _
        return word.replace(new RegExp(character, 'g'), '_');
    }
}


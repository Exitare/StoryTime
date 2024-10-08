import {NgModule} from "@angular/core";
import {ImagePipe} from "./image.pipe";
import {ReplaceCharacterPipe} from "./replace.pipe";
import {LanguageIdPipe} from "./language_id.pipe";


@NgModule(
    {
        declarations: [],
        imports: [ImagePipe, ReplaceCharacterPipe, LanguageIdPipe],
        exports: [ImagePipe, ReplaceCharacterPipe, LanguageIdPipe]
    }
)
export class PipeModule {
}

import {NgModule} from "@angular/core";
import {ImagePipe} from "./image.pipe";
import {ReplaceCharacterPipe} from "./replace.pipe";


@NgModule(
    {
        declarations: [],
        imports: [ImagePipe, ReplaceCharacterPipe],
        exports: [ImagePipe, ReplaceCharacterPipe]
    }
)
export class PipeModule {
}

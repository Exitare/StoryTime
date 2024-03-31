import {NgModule} from "@angular/core";
import {ImagePipe} from "./image.pipe";


@NgModule(
    {
        declarations: [],
        imports: [ImagePipe],
        exports: [ImagePipe]
    }
)
export class PipeModule {
}

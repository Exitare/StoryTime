import {isDevMode, Pipe, PipeTransform} from "@angular/core";


@Pipe({
    name: 'transformCategoryToImage',
    standalone: true
})
export class ImagePipe implements PipeTransform {
    transform(category: string): string {
        console.log(category);
        switch (category) {
            case 'Fairytale':
                return 'assets/categories/fairytale.jpeg';
            case 'Adventure':
                return 'assets/categories/fairytale.jpeg';
            case 'Fantasy':
                return 'assets/categories/fairytale.jpeg';

            default:
                if(isDevMode())
                    console.log('No image found for category: ' + category);
                return 'assets/categories/fallback.jpeg';
        }
    }
}


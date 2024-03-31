import {Pipe, PipeTransform} from "@angular/core";


@Pipe({
    name: 'transformCategoryToImage',
    standalone: true
})
export class ImagePipe implements PipeTransform {
    transform(category: string): string {
        switch (category) {
            case 'FairyTale':
                return 'assets/categories/fairytale.jpeg';
            case 'Adventure':
                return 'assets/categories/fairytale.jpeg';
            case 'Fantasy':
                return 'assets/categories/fairytale.jpeg';

            default:
                return 'assets/categories/fallback.jpeg';
        }
    }
}


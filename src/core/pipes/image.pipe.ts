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
                return 'assets/categories/Fairytale.png';
            case 'Adventure':
                return 'assets/categories/Adventure.png';
            case 'Black History':
                return 'assets/categories/BlackHistory.png';
            case "Deep Sea Life":
                return 'assets/categories/DeepSeaLife.png';
            case "Historical Fiction":
                return 'assets/categories/HistoricalFiction.png';
            case "Mythology":
                return 'assets/categories/Mythology.png';
            case "Nature":
                return 'assets/categories/Nature.png';
            case "Outer Space":
                return 'assets/categories/OuterSpace.png';
            case "Science":
                return 'assets/categories/Science.png';
            case "Women in Science":
                return 'assets/categories/WomenInScience.png';
            case "Fantasy":
                return 'assets/categories/Fantasy.png';

            default:
                if (isDevMode())
                    console.log('No image found for category: ' + category);
                return 'assets/categories/Nature.png';
        }
    }
}


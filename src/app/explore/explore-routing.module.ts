import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ExplorePage} from './explore.page';
import {ExploreCategoryComponent} from "./explore-category/explore-category.component";

const routes: Routes = [
    {
        path: '',
        component: ExplorePage,
    },
    {
        path: 'category/:categoryName',
        component: ExploreCategoryComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExplorePageRoutingModule {
}

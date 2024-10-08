import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { CategorySelectionPage } from './category-selection.page';

describe('CategorySelectionPage', () => {
  let component: CategorySelectionPage;
  let fixture: ComponentFixture<CategorySelectionPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CategorySelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

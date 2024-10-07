import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeRestrictionsPage } from './age-restrictions.page';

describe('AgeRestrictionsPage', () => {
  let component: AgeRestrictionsPage;
  let fixture: ComponentFixture<AgeRestrictionsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AgeRestrictionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

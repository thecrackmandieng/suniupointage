import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantCrudComponent } from './apprenant-crud.component';

describe('ApprenantCrudComponent', () => {
  let component: ApprenantCrudComponent;
  let fixture: ComponentFixture<ApprenantCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

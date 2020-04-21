import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitSharesComponent } from './profit-shares.component';

describe('ProfitSharesComponent', () => {
  let component: ProfitSharesComponent;
  let fixture: ComponentFixture<ProfitSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfitSharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfitSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharerManagementComponent } from './sharer-management.component';

describe('SharerManagementComponent', () => {
  let component: SharerManagementComponent;
  let fixture: ComponentFixture<SharerManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharerManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

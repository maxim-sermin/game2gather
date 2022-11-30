import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveSessionsDialogComponent } from './active-sessions-dialog.component';

describe('ActiveSessionsDialogComponent', () => {
  let component: ActiveSessionsDialogComponent;
  let fixture: ComponentFixture<ActiveSessionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveSessionsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveSessionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

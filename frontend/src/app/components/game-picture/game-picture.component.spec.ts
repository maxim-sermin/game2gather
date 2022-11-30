import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePictureComponent } from './game-picture.component';

describe('GamePictureComponent', () => {
  let component: GamePictureComponent;
  let fixture: ComponentFixture<GamePictureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamePictureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

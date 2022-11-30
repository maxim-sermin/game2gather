import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreGamesComponent } from './score-games.component';

describe('GamesComponent', () => {
  let component: ScoreGamesComponent;
  let fixture: ComponentFixture<ScoreGamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoreGamesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

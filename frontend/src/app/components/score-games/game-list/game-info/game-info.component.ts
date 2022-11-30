import {Component, Input, OnInit} from '@angular/core';
import {GameWithMyScore} from "../../../../services/scores.service";

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss']
})
export class GameInfoComponent implements OnInit {

  @Input() game?: GameWithMyScore;

  constructor() { }

  ngOnInit(): void {
  }
}

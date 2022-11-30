import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-game-picture',
  templateUrl: './game-picture.component.html',
  styleUrls: ['./game-picture.component.scss']
})
export class GamePictureComponent implements OnInit {

  public pictureLinkError = false;
  public _pictureUrl?: string;
  @Input() set pictureUrl(newUrl: string | undefined) {
    this._pictureUrl = newUrl;
    this.pictureLinkError = false;
  }

  constructor() { }

  ngOnInit(): void {
  }

  public handlePictureError(event: any): void {
    this.pictureLinkError = true;
  }
}

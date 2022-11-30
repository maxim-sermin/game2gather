import {Component} from "@angular/core";
import {GenreService} from "../../services/genre.service";
import {AuthenticationService} from "../../services/security/authentication.service";

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.scss']
})
export class GenreComponent {

  constructor(public genreService: GenreService, public authenticationService: AuthenticationService) {
    this.genreService.refreshGenreList(false);
  }
}

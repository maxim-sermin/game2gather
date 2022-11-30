import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { EnvironmentSpecific } from './environmentSpecific';
import {SettingsService} from "./settings.service";
import {ApiConfiguration} from "../../api/api-configuration";

@Injectable({ providedIn: 'root' })
export class SettingsHttpService {

  constructor(private http: HttpClient, private settingsService: SettingsService, private apiConfiguration: ApiConfiguration) {
  }

  initializeApp(): Promise<any> {

    return new Promise(
      (resolve) => {
        this.http.get('assets/environment-specific.json')
          .toPromise()
          .then(response => {
              this.settingsService.environmentSpecific = <EnvironmentSpecific>response;
              this.apiConfiguration.rootUrl = this.settingsService.environmentSpecific.apiUrl!;
              resolve('Got environment variables');
            }
          )
      }
    );
  }
}

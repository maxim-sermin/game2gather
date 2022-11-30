import { EnvironmentSpecific } from './environmentSpecific';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  public environmentSpecific: EnvironmentSpecific;

  constructor() {
    this.environmentSpecific = new EnvironmentSpecific();
  }
}

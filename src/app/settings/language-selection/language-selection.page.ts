import {Component, isDevMode, OnInit} from '@angular/core';
import {SettingsService} from "../../../core/services/settings.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-language-selection',
  templateUrl: './language-selection.page.html',
  styleUrls: ['./language-selection.page.scss'],
})
export class LanguageSelectionPage implements OnInit {

  availableLanguages: string[] = ['en', 'de', 'gr'];
  userSelectedLanguage: string = 'en';

  constructor(private settingsService: SettingsService, private translateService: TranslateService) {

  }

  async ngOnInit() {
    this.userSelectedLanguage = await this.settingsService.getLanguage();
  }

  async userLanguageChanged(language: string) {
    await this.settingsService.saveLanguage(language);
    this.userSelectedLanguage = language;
    this.translateService.use(language);
  }

}

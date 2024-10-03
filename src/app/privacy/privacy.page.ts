import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage implements OnInit {
  pdfSource = "/assets/privacy/privacy.pdf";
  constructor() { }

  ngOnInit() {
  }

}

import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  branch = import.meta.env.NG_APP_BUILD_ENV; // Recommended
  commit = process.env.NG_APP_BUILD_ENV; // Deprecated

  constructor() {
    console.log('meta: ', import.meta.env)
    console.log('process: ', process.env)
  }
}

import { DirectivesModule } from './../directives/directives-module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ManageProfilePage } from './manage-profile.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from './../shared-module/shared.module';
// import {NgxMaskIonicModule} from 'ngx-mask-ionic'
import { TranslateLoader, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MaskitoModule } from '@maskito/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
const routes: Routes = [
  {
    path: '',
    component: ManageProfilePage
  }
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    DirectivesModule,
    MaskitoModule,
    // NgxMaskIonicModule
  ],
  declarations: [ManageProfilePage]
})
export class ManageProfilePageModule {}
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}
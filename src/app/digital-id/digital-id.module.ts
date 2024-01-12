import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DigitalIdPage } from './digital-id.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared-module/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { Screenshot } from '@ionic-native/screenshot/ngx';
import { PreviewAnyFile } from '@awesome-cordova-plugins/preview-any-file/ngx';
import { NgxBarcode6Module } from 'ngx-barcode6';

const routes: Routes = [
  {
    path: '',
    component: DigitalIdPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SharedModule,
    NgxBarcode6Module,
    RouterModule.forChild(routes)
  ],
  declarations: [DigitalIdPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PreviewAnyFile]
  // providers: [Screenshot, PreviewAnyFile]
})
export class DigitalIdPageModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RegisterPage } from './register.page';
import { SharedModule } from '../shared-module/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from './../directives/directives-module';
// import {NgxMaskIonicModule} from 'ngx-mask-ionic'
import { MaskitoModule } from '@maskito/angular';

const routes: Routes = [
  {
    path: '',
    component: RegisterPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DirectivesModule,
    MaskitoModule,
    // NgxMaskIonicModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}

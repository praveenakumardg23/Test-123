import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ForgotPasswordPage } from './forgot-password.page';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from './../directives/directives-module';
import { SharedModule } from '../shared-module/shared.module';


const routes: Routes = [
  {
    path: '',
    component: ForgotPasswordPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DirectivesModule,
    SharedModule


  ],
  declarations: [ForgotPasswordPage]
})
export class ForgotPasswordPageModule {}

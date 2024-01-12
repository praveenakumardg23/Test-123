import { DirectivesModule } from './../directives/directives-module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ResetPasswordPage } from './reset-password.page';
import { SharedModule } from '../shared-module/shared.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ResetPasswordPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes),
    DirectivesModule
  ],
  declarations: [ResetPasswordPage]
})
export class ResetPasswordPageModule {}

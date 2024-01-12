import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextOnlyDirective } from './../directives/text-only.directive';
import { SecurityQuestionsPage } from './security-questions.page';
import { SharedModule } from './../shared-module/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
const routes: Routes = [
  {
    path: '',
    component: SecurityQuestionsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule
  ],
  exports: [TextOnlyDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [SecurityQuestionsPage, TextOnlyDirective]
})
export class SecurityQuestionsPageModule { }

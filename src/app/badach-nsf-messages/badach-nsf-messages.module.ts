import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { BadachNsfMessagesPage } from './badach-nsf-messages.page';
import { SharedModule } from './../shared-module/shared.module';

const routes: Routes = [
  {
    path: '',
    component: BadachNsfMessagesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule
  ],
  declarations: [BadachNsfMessagesPage]
})
export class BadachNsfMessagesPageModule {}

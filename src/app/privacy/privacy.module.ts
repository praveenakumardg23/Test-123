import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SharedPluginModule } from './../shared-module/shared-plugin-module';

import { PrivacyPage } from './privacy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    SharedPluginModule
  ],
  declarations: [PrivacyPage]
})
export class PrivacyPageModule {}

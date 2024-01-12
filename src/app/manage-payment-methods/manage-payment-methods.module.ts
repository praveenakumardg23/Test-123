import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { MaterialModule } from './../material.module';
import { IonicModule } from '@ionic/angular';
// import { CardIO } from '@ionic-native/card-io/ngx';

import { ManagePaymentMethodsPage } from './manage-payment-methods.page';
import { SharedModule } from '../shared-module/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from './../directives/directives-module';


const routes: Routes = [
  {
    path: '',
    component: ManagePaymentMethodsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MaterialModule,
    TranslateModule,
    DirectivesModule
  ],
  // providers: [CardIO],
  providers: [],
  declarations: [ManagePaymentMethodsPage]
})
export class ManagePaymentMethodsPageModule {}

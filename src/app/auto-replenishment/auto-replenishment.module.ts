import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AutoReplenishmentPage } from './auto-replenishment.page';
import { TranslateModule } from '@ngx-translate/core';
import { AutoReplenishmentFundComponent } from './auto-replenishment-fund/auto-replenishment-fund.component';
import { AutoReplenishmentMealComponent } from './auto-replenishment-meal/auto-replenishment-meal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: AutoReplenishmentPage
  }
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    
  ],
  declarations: [AutoReplenishmentPage, AutoReplenishmentFundComponent, AutoReplenishmentMealComponent]
})
export class AutoReplenishmentPageModule {}

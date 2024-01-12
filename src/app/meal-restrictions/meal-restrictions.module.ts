import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared-module/shared.module';
import { IonicModule } from '@ionic/angular';

import { MealRestrictionsPage } from './meal-restrictions.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: MealRestrictionsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    SharedModule,
   
  ],
  declarations: [MealRestrictionsPage]
})
export class MealRestrictionsPageModule {}

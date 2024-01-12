import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CafeteriaBalanceComponent } from './cafeteria-balance.component';

const routes: Routes = [
  {
    path: '',
    component: CafeteriaBalanceComponent
  }
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    MatSelectModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CafeteriaBalanceComponent]
})
export class CafeteriaBalanceModule {}
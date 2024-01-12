import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PatronDetailPage } from './patron-detail.page';
import { MealsComponent } from './meals/meals.component';
import { FundComponent } from './fund/fund.component';
import { FundraiserComponent } from './fundraiser/fundraiser.component';
import { FeesComponent } from './fees/fees.component';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: PatronDetailPage,
    children: [
      { path: '', redirectTo: 'meals', pathMatch: 'full' },
      { path: 'meals', component: MealsComponent },
      { path: 'fees', component: FeesComponent },
      { path: 'fund', component: FundComponent },
      { path: 'fundraiser', component: FundraiserComponent }
    ]
  }
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PatronDetailPage, MealsComponent, FeesComponent, FundComponent,FundraiserComponent]
})
export class PatronDetailPageModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UseNewCardPage } from './use-new-card.page';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule } from '../../directives/directives-module';

const routes: Routes = [
  {
    path: '',
    component: UseNewCardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    DirectivesModule
  ],
  declarations: [UseNewCardPage]
})
export class UseNewCardPageModule {}

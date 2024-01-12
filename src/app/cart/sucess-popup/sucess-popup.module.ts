import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SucessPopupComponent } from './sucess-popup.component';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';


const routes: Routes = [
  {
    path: '',
    component: SucessPopupComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [SucessPopupComponent]
})
export class SucessPopupModule { }

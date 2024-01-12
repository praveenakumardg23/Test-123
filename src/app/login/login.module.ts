import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from './../shared-module/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { IonicModule } from '@ionic/angular';
import { HelppopupComponent } from '../helppopup/helppopup.component';
import { LoginPage } from './login.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    MaterialModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [LoginPage,HelppopupComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // entryComponents:[HelppopupComponent]
})
export class LoginPageModule {}

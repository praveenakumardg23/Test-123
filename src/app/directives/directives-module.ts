import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { NumbersOnlyDirective } from './numbers-only.directive';
import { PhoneMaskDirective } from './phone-mask.directive';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [NumbersOnlyDirective, PhoneMaskDirective],
  declarations: [NumbersOnlyDirective, PhoneMaskDirective]
})
export class DirectivesModule { }
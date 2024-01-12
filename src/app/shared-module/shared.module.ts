import { RegisterLoginTabComponent } from './../register-login-tab/register-login-tab.component';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTextWithSymbolDirective } from 'src/app/directives/custom-text-with-symbol.directive'
import { EqualValidator } from '../directives/equal-validator.directive';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  declarations: [CustomTextWithSymbolDirective, EqualValidator, RegisterLoginTabComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    CustomTextWithSymbolDirective, EqualValidator, RegisterLoginTabComponent
  ]
})
export class SharedModule { 
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [ CustomTextWithSymbolDirective ]
    };
  }
}

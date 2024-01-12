import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FundraiserFeeRoutes } from './fundaraiserfee-routing';
import { FundraiserFeesComponent } from './fundraiser-fees/fundraiser-fees.component';
import { FundraiserGuestCheckoutFeesComponent } from './fundraiser-guest-checkout-fees/fundraiser-guest-checkout-fees.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PaymentRecieptComponent } from './payment-reciept/payment-reciept.component';
import { FundraiserCartComponent } from './fundraiser-cart/fundraiser-cart.component';


@NgModule({
  declarations: [
    FundraiserFeesComponent,
    FundraiserGuestCheckoutFeesComponent,
    PaymentRecieptComponent,
    FundraiserCartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(FundraiserFeeRoutes),
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FundraiserfeeModule { }

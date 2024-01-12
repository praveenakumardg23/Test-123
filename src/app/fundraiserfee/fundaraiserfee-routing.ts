import { Routes } from '@angular/router';
import { FundraiserFeesComponent } from './fundraiser-fees/fundraiser-fees.component';
import { FundraiserGuestCheckoutFeesComponent } from './fundraiser-guest-checkout-fees/fundraiser-guest-checkout-fees.component';
import { PaymentRecieptComponent } from './payment-reciept/payment-reciept.component';
import { FundraiserCartComponent } from './fundraiser-cart/fundraiser-cart.component'

export const FundraiserFeeRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'fundraiser-guest-checkout', pathMatch: 'full' },
      { path: 'fundraiser-guest-checkout', component: FundraiserGuestCheckoutFeesComponent },
      { path: 'fundraiser-fees', component: FundraiserFeesComponent },
      { path: 'payment-reciept', component: PaymentRecieptComponent},
      { path: 'fundraiser-cart', component: FundraiserCartComponent}
    ]
  }
];
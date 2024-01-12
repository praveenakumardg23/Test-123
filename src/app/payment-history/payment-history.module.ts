import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// import { OrderModule } from 'ngx-order-pipe';
import { IonicModule } from '@ionic/angular';

import { PaymentHistoryPage } from './payment-history.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgArrayPipesModule } from 'ngx-pipes';


const routes: Routes = [
  {
    path: '',
    component: PaymentHistoryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // OrderModule,
    NgArrayPipesModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgxPaginationModule
  ],
  declarations: [PaymentHistoryPage]
})
export class PaymentHistoryPageModule {}

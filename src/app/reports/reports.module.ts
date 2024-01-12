import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ReportsPage } from './reports.page';
import { TranslateModule } from '@ngx-translate/core';
import { MealReportsComponent } from './meal-reports/meal-reports.component';
import { FundReportsComponent } from './fund-reports/fund-reports.component';
import { NgxPaginationModule } from 'ngx-pagination';
import {NgArrayPipesModule} from 'ngx-pipes';

// import { OrderModule } from 'ngx-order-pipe';

const routes: Routes = [
  { path: '',component: ReportsPage}
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    NgxPaginationModule,
    // OrderModule
    NgArrayPipesModule
  ],
  declarations: [
    ReportsPage,
    MealReportsComponent,
    FundReportsComponent
  ]
})
export class ReportsPageModule {}

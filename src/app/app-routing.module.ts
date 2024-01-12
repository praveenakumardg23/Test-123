import { AuthGuard } from './auth/auth.guard';
import { RegisterPhaseComponent } from './register-phase/register-phase.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPaymentReceiptComponent } from './patron-detail/login-payment-receipt/login-payment-receipt.component';

const routes: Routes = [
  { 
    path: '',
    component: RegisterPhaseComponent,
    canActivateChild:[AuthGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadChildren: () => import('./login/login.module').then(x => x.LoginPageModule)},
      { path: 'register', loadChildren: () => import('./register/register.module').then(x => x.RegisterPageModule)},
      { path: 'security-questions', loadChildren: () => import('./security-questions/security-questions.module').then(x => x.SecurityQuestionsPageModule)},
      { path: 'manage-patrons', loadChildren: () => import('./manage-patrons/manage-patrons.module').then(x => x.ManagePatronsPageModule)},
      { path: 'manage-payment-methods', loadChildren: () => import('./manage-payment-methods/manage-payment-methods.module').then(x => x.ManagePaymentMethodsPageModule)},
      { path: 'reset-password', loadChildren: () => import('./reset-password/reset-password.module').then(x => x.ResetPasswordPageModule)},
      { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(x => x.NotificationsPageModule)},
      { path: 'terms', loadChildren: () => import('./terms/terms.module').then(x => x.TermsPageModule)},
      { path: 'privacy', loadChildren: () => import('./privacy/privacy.module').then(x => x.PrivacyPageModule)},
      { path: 'forgot-password', loadChildren: () => import('./forgot-password/forgot-password.module').then(x => x.ForgotPasswordPageModule)},
      { path: 'global-messages', loadChildren: () => import('./global-messages/global-messages.module').then(x => x.GlobalMessagesPageModule)},
      { path: 'fundraiserfee', loadChildren: () => import('./fundraiserfee/fundraiserfee.module').then(x => x.FundraiserfeeModule)},

    ]
  },
  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivateChild:[AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'manage-profile', loadChildren: () => import('./manage-profile/manage-profile.module').then(x => x.ManageProfilePageModule)},
      { path: 'manage-patrons', loadChildren: () => import('./manage-patrons/manage-patrons.module').then(x => x.ManagePatronsPageModule)},
      { path: 'security-questions', loadChildren: () => import('./security-questions/security-questions.module').then(x => x.SecurityQuestionsPageModule)},
      { path: 'manage-payment-methods', loadChildren: () => import('./manage-payment-methods/manage-payment-methods.module').then(x => x.ManagePaymentMethodsPageModule)},
      { path: 'payment-history', loadChildren: () => import('./payment-history/payment-history.module').then(x => x.PaymentHistoryPageModule)},
      { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(x => x.NotificationsPageModule)},
      { path: 'cafeteria-balance', loadChildren: () => import('./cafeteria-balance/cafeteria-balance.module').then(x => x.CafeteriaBalanceModule)},
      { path: 'messages', loadChildren: () => import('./messages/messages.module').then(x => x.MessagesPageModule)},
      { path: 'cart', loadChildren: () => import('./cart/cart.module').then(x => x.CartPageModule)},
      { path: 'home', loadChildren: () => import('./home/home.module').then(x => x.HomePageModule)},
      { path: 'auto-replenishment', loadChildren: () => import('./auto-replenishment/auto-replenishment.module').then(x => x.AutoReplenishmentPageModule)},
      { path: 'schedule-fees', loadChildren: () => import('./schedule-fees/schedule-fees.module').then(x => x.ScheduleFeesPageModule)},
      { path: 'patron-detail', loadChildren: () => import('./patron-detail/patron-detail.module').then(x => x.PatronDetailPageModule)},
      { path: 'reports', loadChildren: () => import('./reports/reports.module').then(x => x.ReportsPageModule)},
      { path: 'meal-restrictions', loadChildren: () => import('./meal-restrictions/meal-restrictions.module').then(x => x.MealRestrictionsPageModule)},
      { path: 'fund-transfer', loadChildren: () => import('./patron-detail/fund/fund-transfer/fund-transfer.module').then(x => x.FundTransferPageModule)},
      { path: 'auto-replenishment-terms', loadChildren: () => import('./auto-replenishment-terms/auto-replenishment-terms.module').then(x => x.AutoReplenishmentTermsPageModule)},
      { path: 'checkout', loadChildren: () => import('./cart/checkout/checkout.module').then(x => x.CheckoutPageModule)},
      { path: 'use-new-card', loadChildren: () => import('./cart/use-new-card/use-new-card.module').then(x => x.UseNewCardPageModule)},
      { path: 'digital-id', loadChildren: () => import('./digital-id/digital-id.module').then(x => x.DigitalIdPageModule)},
      { path: 'pre-order-meals', loadChildren: () => import('./pre-order-meals/pre-order-meals.module').then(x => x.PreOrderMealsPageModule)},
      { path: 'badach-nsf-messages', loadChildren: () => import('./badach-nsf-messages/badach-nsf-messages.module').then(x => x.BadachNsfMessagesPageModule)},

      { path: 'payment-reciept', component: LoginPaymentReceiptComponent},
      
    ]
  },
  { path: 'help', loadChildren: () => import('./help/help.module').then(x => x.HelpPageModule)},
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

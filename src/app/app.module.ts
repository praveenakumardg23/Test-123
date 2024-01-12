import { NgxPaginationModule } from 'ngx-pagination';
import { CheckoutPageModule } from './cart/checkout/checkout.module';
import { CheckoutPage } from './cart/checkout/checkout.page';
import { UseNewCardPage } from './cart/use-new-card/use-new-card.page';
import { UseNewCardPageModule } from './cart/use-new-card/use-new-card.module';
import { FundTransferPageModule } from './patron-detail/fund/fund-transfer/fund-transfer.module';
import { FundTransferPage } from './patron-detail/fund/fund-transfer/fund-transfer.page';
import { ScheduleFeesPageModule } from './schedule-fees/schedule-fees.module';
import { ScheduleFeesPage } from './schedule-fees/schedule-fees.page';
import { MessagesMenuComponent } from './messages/messages-menu/messages-menu.component';
import { InboxComponent } from './messages/inbox/inbox.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterPhaseComponent } from './register-phase/register-phase.component';
import { LoginPageModule } from './login/login.module';
import { RegisterPageModule } from './register/register.module';
import { ResetPasswordPageModule } from './reset-password/reset-password.module';
import { MessagesPageModule } from './messages/messages.module';
import { ManagePaymentMethodsPageModule } from './manage-payment-methods/manage-payment-methods.module';
import { ManagePatronsPageModule } from './manage-patrons/manage-patrons.module';
import { SecurityQuestionsPageModule } from './security-questions/security-questions.module';
import { Interceptor } from './interceptor/interceptor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { SharedModule } from './shared-module/shared.module';
import { TermsPage } from './terms/terms.page';
import { TermsPageModule } from './terms/terms.module';
import { PrivacyPage } from './privacy/privacy.page';
import { PrivacyPageModule } from './privacy/privacy.module';
import { HelpPage } from './help/help.page';
import { HelpPageModule } from './help/help.module';
import { ManageProfilePageModule } from './manage-profile/manage-profile.module';
import { ForgotPasswordPageModule } from './forgot-password/forgot-password.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TouchID } from '@awesome-cordova-plugins/touch-id/ngx';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { TextWithSymbolDirective } from './directives/text-with-symbol.directive';
import { DecimalNumbersDirective } from './directives/decimal-numbers.directive';
import { DateformatDirective } from './directives/dateformat.directive';
import { FilterPipe } from './directives/filter.pipe';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SafariViewController } from '@awesome-cordova-plugins/safari-view-controller/ngx';
import { SharedPluginModule } from './shared-module/shared-plugin-module';
import { DatePipe } from '@angular/common';
import { DirectivesModule } from './directives/directives-module';
// import { NgxMaskIonicModule } from 'ngx-mask-ionic';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AutoReplenishmentTermsPage } from './auto-replenishment-terms/auto-replenishment-terms.page';
import { AutoReplenishmentTermsPageModule } from './auto-replenishment-terms/auto-replenishment-terms.module';
import { GlobalMessagesPageModule } from './global-messages/global-messages.module';
import { Screenshot } from 'awesome-cordova-plugins-screenshot/ngx';
import { CustomFieldsComponent } from './custom-fields/custom-fields.component';
import { AddToCartPopupComponent } from './add-to-cart-popup/add-to-cart-popup.component';
import { FundraiserInfoPopUpComponent } from './fundraiser-info-pop-up/fundraiser-info-pop-up.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CafeteriaTransferPopupComponent } from './cafeteria-transfer-popup/cafeteria-transfer-popup.component';
import { SucessPopupComponent } from './cart/sucess-popup/sucess-popup.component';
import { SucessPopupModule } from './cart/sucess-popup/sucess-popup.module';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
// import { OrderModule } from 'ngx-order-pipe';

import {NgArrayPipesModule} from 'ngx-pipes';
import { LoginPaymentReceiptComponent } from './patron-detail/login-payment-receipt/login-payment-receipt.component';
import { BiometricWrapper } from '@awesome-cordova-plugins/biometric-wrapper/ngx';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Keychain } from '@awesome-cordova-plugins/keychain/ngx';
import {FingerprintAIO} from '@awesome-cordova-plugins/fingerprint-aio/ngx';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  
  declarations: [
    AppComponent,
    RegisterPhaseComponent,
    DashboardComponent,
    CustomFieldsComponent,
    AddToCartPopupComponent,
    CafeteriaTransferPopupComponent,
    FundraiserInfoPopUpComponent,
    TextWithSymbolDirective,
    DecimalNumbersDirective,
    DateformatDirective,
    FilterPipe,
    LoginPaymentReceiptComponent
  ],
  // entryComponents: [
  //   AutoReplenishmentTermsPage,
  //   FundraiserInfoPopUpComponent,
  //   CustomFieldsComponent,
  //   AddToCartPopupComponent,
  //   PrivacyPage,
  //   HelpPage,
  //   InboxComponent,
  //   RegisterLoginTabComponent,
  //   MessagesMenuComponent,
  //   ScheduleFeesPage,
  //   FundTransferPage,
  //   CheckoutPage,
  //   UseNewCardPage,
  //   CafeteriaTransferPopupComponent,
  //   TermsPage,
  //   SucessPopupComponent,
  //   LoginPaymentReceiptComponent],
  imports: [
    BrowserModule,
    SharedModule.forRoot(),
    IonicModule.forRoot({
      scrollPadding: false,
      scrollAssist: true,
      mode: 'ios',
      swipeBackEnabled: false,
      hardwareBackButton: false,
      innerHTMLTemplatesEnabled: true
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    LoginPageModule,
    RegisterPageModule,
    ResetPasswordPageModule,
    MessagesPageModule,
    ManagePaymentMethodsPageModule,
    ManagePatronsPageModule,
    FormsModule,
    ReactiveFormsModule,
    SecurityQuestionsPageModule,
    HttpClientModule,
    // OrderModule,
NgArrayPipesModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    IonicStorageModule.forRoot(),
    TermsPageModule,
    PrivacyPageModule,
    AutoReplenishmentTermsPageModule,
    HelpPageModule,
    ManageProfilePageModule,
    ForgotPasswordPageModule,
    SharedPluginModule,
    ScheduleFeesPageModule,
    FundTransferPageModule,
    CheckoutPageModule,
    UseNewCardPageModule,
    DirectivesModule,
    GlobalMessagesPageModule,
    SucessPopupModule,
    // NgxMaskIonicModule.forRoot(),
    NgxPaginationModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [TranslateModule, DirectivesModule,],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    },
    Deeplinks,
    Keyboard,
    InAppBrowser,
    SafariViewController,
    DatePipe,
    Screenshot,
    NativeStorage,
    BiometricWrapper,
    Diagnostic,
    AndroidPermissions,
    Keychain,
    TouchID,
    FingerprintAIO,
      ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


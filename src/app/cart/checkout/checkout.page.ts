import { AlertService } from 'src/app/services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController, NavController } from '@ionic/angular';
import { Component, OnInit, SecurityContext } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from './../../services/data/data.service';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { SucessPopupComponent } from '../sucess-popup/sucess-popup.component';
import { LanguageService } from 'src/app/services/language/language.service'; 
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  cartData: any;
  PaymentType: any;
  ProcessingFee: any;
  agreeTermChecked = false;
  cartTotalChecked: false;
  selectedPaymentMethodID: any;
  cartItems: any;
  cardType: string;
  tempCardReqObj: any;
  isSaveCardChecked: string;
  hasAnyFeeAttributeExhausted: boolean;
  hasAnyFeeAttributeAddedLater: boolean;
  EXHAUSTED_AVAILABLE_QUANTITY = -1;
  intTransactionID: any;
  siteID: any;
  paymentReceipt: any;
  downloading: boolean;
  isGuest = false;
  Email: any;
  guestEmail: any;
  ccEmail: any;
  guestCardReqObj: any;
  isGuestCheckout = false;
  districtFeaturelist: any;
  totalLunchLimit: number;
  totalFundLimit: number;

  constructor(navParams: NavParams,
              public languageService: LanguageService,
              private modalController: ModalController,
              private alertController: AlertController,
              private sharedService: SharedService,
              private dataService: DataService,
              private router: Router,
              private translate: TranslateService,
              private toastController: ToastController,
              private alertService: AlertService,
              private navCtrl: NavController,
              private file: File,
              private fileOpener: FileOpener,
              private sanitizer: DomSanitizer
  ) {
    this.cartData = navParams.get('Data').cartData;
    this.cartItems = navParams.get('Data').cartItems;
    this.cardType = navParams.get('Data').cardType;
    this.PaymentType = navParams.get('Data').paymentData.PaymentType;
    this.selectedPaymentMethodID = navParams.get('Data').selectedPaymentMethodID;
    this.Email = navParams.get('Data').Email;
    this.guestCardReqObj = navParams.get('Data').tempCardReqObj;
    if (this.cardType === 'tempCard') {
      this.tempCardReqObj = navParams.get('Data').tempCardReqObj;
      this.isSaveCardChecked = navParams.get('Data').isSaveCardChecked;
    }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.isGuestCheckout = (localStorage.getItem('isGuestCheckout') === 'true') ? true : false;
    this.getProcessFeeBreakdown(this.PaymentType);
    this.sharedService.refreshCart.next(false);
    this.isGuest = this.sharedService.isGuestUser;
    console.log('guestEmail', this.Email);
    this.guestEmail = sessionStorage.getItem('Email');
    this.ccEmail = sessionStorage.getItem('CCEmail');
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    if(this.districtFeaturelist !== null){
      this.totalLunchLimit = this.districtFeaturelist.PaymentLimits.TotalLunchAcctLimit.toFixed(2);
      this.totalFundLimit = this.districtFeaturelist.PaymentLimits.TotalSourceAcctLimit.toFixed(2);
    }

  }

  getProcessFeeBreakdown(paymentType) {
    let payload = {
      "PaymentMethod": paymentType
    }
    this.sharedService.loading.next(true);
    this.dataService.getProcessFeeBreakdown(payload)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success' && response.status === 200) {
            this.ProcessingFee = 0;
            let ICFAmount = 0;
            let TransactionFeeAmt = 0;
            let TransactionFees = response.body.TransactionFees
            if (this.cartData.TotalAmountDue <= 0) {
              this.agreeTermChecked = true;
              return;
            }
            if (TransactionFees.length > 0 && this.cartData.TotalAmountDue > 0) {
              TransactionFees.forEach((TransactionFee) => {
                ICFAmount = ICFAmount + TransactionFee.ICFeeSubtotal;
                TransactionFeeAmt = TransactionFeeAmt + TransactionFee.TransactionFeeAmount;
              });
              this.ProcessingFee = ICFAmount + TransactionFeeAmt;
            }
          } else if (response.body.APIStatus === 'Error' && response.body.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
            const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
            this.alertService.failureToast(message);
            this.modalController.dismiss();
          } else {
            const message = this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
            this.modalController.dismiss();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  async achTermsAlert() {
    const messages = this.sanitizer.sanitize(SecurityContext.HTML, this.translate.instant('ach_alert_message'));
    const alert = await this.alertController.create({
      header: this.translate.instant('ach_alert_header'),
      message: messages,
      buttons: [this.translate.instant('ok')]
    });
    await alert.present();
  }

  async ccTermsAlert() {
    const messages = this.sanitizer.sanitize(SecurityContext.HTML, this.translate.instant('creaditcard_message') +
    `<ion-row class="ion-justify-content-center card-img">
     <ion-img class="custom-img" src="assets/images/all credit cards.png"></ion-img></ion-row>`)
    const alert = await this.alertController.create({
      header: this.translate.instant('creaditcard_alert_header'),
      message: messages,
      cssClass: 'cctermsalert',
      buttons: [this.translate.instant('ok')]
    });
    await alert.present();
  }

  async helpAlert() {
    const alert = await this.alertController.create({
      message: this.translate.instant('Safeguard_tooltip'),
      buttons: [this.translate.instant('ok')]
    });

    await alert.present();
  }

  onDismiss() {
    this.modalController.dismiss()
      .then((data) => {
      });
  }

  async guestPayemnt() {
    const cartArray = [];
    this.cartItems[0].childitems.forEach(element => {
      const cartobj = {
        'IntPatronCartId': element.IntPatronCartId,
        "AdjustedAmountDue": element.AdjustedAmountDue,
        "CartAmount": element.CartAmount,
        "ApplyMealBalanceSw": false
      };
      cartArray.push(cartobj);
    });
    let payload = {
      NickName: this.guestCardReqObj.NickName,
      FirstName: this.guestCardReqObj.FirstName,
      LastName: this.guestCardReqObj.LastName,
      Default: false,
      CartItems: cartArray,
      UserEmail: this.guestEmail,
      CCEmail: this.ccEmail,
      Number: this.guestCardReqObj.Number,
      ExpirationMonth: this.guestCardReqObj.ExpirationMonth,
      ExpirationYear: this.guestCardReqObj.ExpirationYear,
      Cvv: this.guestCardReqObj.Cvv,
    };

    this.modalController.dismiss()
      .then((data) => {
      });
    this.sharedService.loading.next(true);

    this.dataService.processGuestPayment(payload).subscribe(
      async (response: any) => {

        if (response.body.APIStatus === 'Success') {
          this.sharedService.loading.next(false);
          this.intTransactionID = response.body.Transactions[0].IntTransactionId;
          this.siteID = response.body.Transactions[0].SiteId;
          const obj = {
            'Amountdue': this.cartData.TotalAmountDue + this.ProcessingFee
          };
          let header: any = this.translate.instant('Payment_Success');
          let message: any = this.translate.instant('Payment_msg') + '  ' + '$'
                                + obj.Amountdue + '.' + ' ' + this.translate.instant('Payment_receipt_message');
          this.alertWithReturnToDashboard(header, message);
        } else {
          this.afterProcessCart(response.body, 'CC');
          this.sharedService.loading.next(false);
        }

      }
    );
  }

  onMakePayemnt() {
    if (this.cardType) {
      if (this.isSaveCardChecked) {
        this.addTempCreditCard(this.tempCardReqObj);
      } else {
        const cartArray = [];

        this.cartItems.forEach((cartItem) => {
          const obj = {
            "IntPatronCartId": cartItem.IntPatronCartId,
            "AdjustedAmountDue": null,
            "CartAmount": cartItem.CartAmount,
            "ApplyMealBalanceSw": cartItem.ApplyMealBalance
          }
          cartArray.push(obj);
        });
        this.tempCardReqObj.CartItems = cartArray;
        this.processTempCard(this.tempCardReqObj);
      }
    } else {
      const cartArray = [];

      this.cartItems.forEach((cartItem) => {
        const obj = {
          "IntPatronCartId": cartItem.IntPatronCartId,
          "AdjustedAmountDue": null,
          "CartAmount": cartItem.CartAmount,
          "ApplyMealBalanceSw": cartItem.ApplyMealBalance
        }
        cartArray.push(obj);
      });
      const reqObj = {
        "PaymentMethodId": this.selectedPaymentMethodID,
        "CartItems": cartArray
      }
      console.log(this.cartData.TotalAmountDue);
      console.log('ProcessingFee', this.ProcessingFee);
      console.log(this.PaymentType);
      this.alertService.cartLoader();
      if (this.cartData.TotalAmountDue === 0) {
        this.sharedService.loading.next(true);
        this.dataService.processZeroDollar(reqObj)
          .subscribe(
            (response: any) => {
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
              this.afterZeroProcessCart(response.body);
            },
            (error) => {
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
              console.log(error);
            }
          );
      } else if (this.PaymentType === 'CC' && ((this.cartData.TotalAmountDue + this.ProcessingFee) > 0)) {  // Credit card checkout
        this.sharedService.loading.next(true);
        this.dataService.processCreditCard(reqObj)
          .subscribe(
            (response: any) => {
              console.log(response, 'make payment response');
              if (response.body.APIStatus === 'Success') {
                this.intTransactionID = response.body.Transactions[0].IntTransactionId;
                this.siteID = response.body.Transactions[0].SiteId;
              }
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
              this.afterProcessCart(response.body, 'CC');
            },
            (error) => {
              console.log(error);
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
            }
          );
      } else if (this.PaymentType === 'ACH' && ((this.cartData.TotalAmountDue + this.ProcessingFee) > 0)) {
         // Automated Clearing House checkout
        this.sharedService.loading.next(true);
        this.dataService.processAutomatedClearingHouse(reqObj)
          .subscribe(
            (response: any) => {
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
              this.afterProcessCart(response.body, 'ACH');
            },
            (error) => {
              this.sharedService.loading.next(false);
              this.alertService.cartLoaderDismiss();
              console.log(error);
            }
          );
      } else {
        const cartErrorMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
        this.alertWithCloseButton(this.translate.instant('error'), cartErrorMsg);
      }
    }
  }

  addTempCreditCard(reqObject) {

    this.sharedService.loading.next(true);
    this.dataService.addCreditCard(reqObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success' && response.status === 200) {
            this.alertService.successToast(this.translate.instant('Payment_added_successfully'));
            const cartArray = [];

            this.cartItems.forEach((cartItem) => {
              const obj = {
                "IntPatronCartId": cartItem.IntPatronCartId,
                "AdjustedAmountDue": cartItem.AdjustedAmountDue ? cartItem.AdjustedAmountDue : null,
                "CartAmount": cartItem.CartAmount
              }
              cartArray.push(obj);
            });
            reqObject.CartItems = cartArray;
            this.processTempCard(reqObject);
          } else if (response.body.APIStatus === 'Error' && response.body.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
            const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
            this.alertService.failureToast(message);
          } else {
            const message = this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  processTempCard(reqObject) {
    this.sharedService.loading.next(true);
    this.alertService.cartLoader();
    this.dataService.processTempCreditCard(reqObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.alertService.cartLoaderDismiss();
          this.afterProcessCart(response.body, 'CC');
        },
        (error) => {
          this.sharedService.loading.next(false);
          this.alertService.cartLoaderDismiss();
          console.log(error);
        }
      );
  }

  showTerms() {
    if (this.PaymentType === 'CC') {
      this.ccTermsAlert();
    } else {
      this.achTermsAlert();
    }
  }
  onInfo() {
    if(this.languageService.langDir  === 'rtl'){
      if (this.sharedService.isGuestUser === true) {
        const ccProcessingFee = this.PaymentType === 'ACH' ? parseFloat(this.ProcessingFee): 0;
        const achProcessingFee = this.PaymentType === 'CC' ? parseFloat(this.ProcessingFee): 0;
        const r1 = '<ion-text class="ion-text-right">';
        const r2 = '<p>' + this.translate.instant('Processing_fee') + '<span class="ion-float-left">$'+
         ccProcessingFee.toFixed(2) + '</span></p>';
        const r3 = '<p>' + this.translate.instant('Transaction_fee') + '<span class="ion-float-left">$'+
        ccProcessingFee.toFixed(2) + '</span></p>';
        const r4 = '<p>' + this.translate.instant('internet_con_fee') + '<span class="ion-float-left">$'+
        achProcessingFee.toFixed(2) + '</span></p>';
        const r5 = '</ion-text>';
        let message = r1 + r2 + r3 + r4 + r5;
        this.alertService.alert(this.translate.instant('Processing_fee'), this.sanitizer.sanitize(SecurityContext.HTML, message));
      } else {
        const ccProcessingFee = this.PaymentType === 'ACH' ? parseFloat(this.ProcessingFee):0;
        const achProcessingFee = this.PaymentType === 'CC' ? parseFloat(this.ProcessingFee):0;
        const r1 = '<ion-text class="ion-text-right">';
        const r2 = '<p>' + this.translate.instant('Transaction_fee') + '<span class="ion-float-left">$'+
                    ccProcessingFee.toFixed(2) + '</span></p>';
        const r3 = '<p>' + this.translate.instant('internet_con_fee') + '<span class="ion-float-left">$'+
                    achProcessingFee.toFixed(2) + '</span></p>';
        const r4 = '</ion-text>';
        const message = r1 + r2 + r3 + r4;
        this.alertService.alert(this.translate.instant('Processing_fee'), this.sanitizer.sanitize(SecurityContext.HTML, message));
      }
    }else{
      if (this.sharedService.isGuestUser === true) {
        const ccProcessingFee = this.PaymentType === 'ACH' ? parseFloat(this.ProcessingFee):0;
        const achProcessingFee = this.PaymentType === 'CC' ? parseFloat(this.ProcessingFee):0;
        const r1 = '<ion-text class="ion-text-left">';
        const r2 = '<p>' + this.translate.instant('Processing_fee') + '<span class="ion-float-right">$ ' +
         ccProcessingFee.toFixed(2) + '</span></p>';
        const r3 = '<p>' + this.translate.instant('Transaction_fee') + '<span class="ion-float-right">$ ' +
        ccProcessingFee.toFixed(2) + '</span></p>';
        const r4 = '<p>' + this.translate.instant('internet_con_fee') + '<span class="ion-float-right">$ ' +
        achProcessingFee.toFixed(2) + '</span></p>';
        const r5 = '</ion-text>';
        const message = r1 + r2 + r3 + r4 + r5;
        this.alertService.alert(this.translate.instant('Processing_fee'), this.sanitizer.sanitize(SecurityContext.HTML, message));
      } else {
        const ccProcessingFee = this.PaymentType === 'ACH' ? parseFloat(this.ProcessingFee):0;
        const achProcessingFee = this.PaymentType === 'CC' ? parseFloat(this.ProcessingFee):0;
        const r1 = '<ion-text class="ion-text-left">';
        const r2 = '<p>' + this.translate.instant('Transaction_fee') + '<span class="ion-float-right">$ ' +
                    ccProcessingFee.toFixed(2) + '</span></p>';
        const r3 = '<p>' + this.translate.instant('internet_con_fee') + '<span class="ion-float-right">$ ' +
                    achProcessingFee.toFixed(2) + '</span></p>';
        const r4 = '</ion-text>';
        const message = r1 + r2 + r3 + r4;
        this.alertService.alert(this.translate.instant('Processing_fee'), this.sanitizer.sanitize(SecurityContext.HTML, message));
      }
    }
    

  }

  async afterProcessCart(response, PaymentType) {
    // this.IsLoadingVisible = true;
    let errorCount = 0;
    if (response.Transactions > 0) {
      errorCount = response.Transactions.filter(s => s.Status !== 'S');
    } else {
      errorCount = 0;
    }

    if(response.APIStatus === 'Success' && response.Transactions){
      this.intTransactionID = response.Transactions[0].IntTransactionId;
      this.siteID = response.Transactions[0].SiteId;
    }

    if (response.APIStatus === 'Success' && errorCount === 0) {

      const totalAmount = Number(response.Total).toFixed(2);
      let cartSuccessMessage = this.translate.instant('cartSuccessMessage_txt1') + totalAmount + this.translate.instant('email_sent');

      if (PaymentType === 'ACH') {
        cartSuccessMessage = cartSuccessMessage + this.translate.instant('cartSuccessMessage_note_txt');
      }
      this.alertWithReturnToDashboard(this.translate.instant('IS_Success'), cartSuccessMessage);
    } else {

      if (response.APIStatus === 'Success') {
        const PEProcessingMessages = '- ' + response.PEProcessingMessages[0];
        const cartSuccessMessage = this.translate.instant('cartErrorMessage_txt') + PEProcessingMessages;
        this.alertWithReturnToDashboard(this.translate.instant('IS_Success'), cartSuccessMessage);
      } else if (response.APIStatus === 'Error') {
        let peMsgs = '';
        if (response.PEProcessingMessages != null && response.PEProcessingMessages.length > 0) {
          // if (!this.isGuestCheckout) {
          //   this.modalController.dismiss();
          // }
          const peMsgArray = response.PEProcessingMessages;
          peMsgs = peMsgArray.join(',');
          peMsgs = peMsgs.slice(0, -1);
        }
          if(peMsgs !== null && peMsgs.trim() !== "" && peMsgs !== undefined) {
          const cartErrorMsg = this.translate.instant('check_out_Errormessage');
          const m1 = cartErrorMsg + ' - ' + peMsgs;
          const m2 = this.isGuestCheckout ? this.translate.instant('Guest_paymentdeclined') : this.translate.instant('check_out_paymentdeclined');
          const message = '<p>' + m1 + '</p><p>' + m2 + '</p>';
          this.alertWithDashboardCartButton(this.translate.instant('error'), message);
        } else if (response.APIStatusReason === 'MERCHANT_ACCOUNT_NOT_FOUND') {
          const PEProcessingMessages = ' - ' + this.translate.instant(response.APIStatusReason);
          const cartErrorMsg = this.translate.instant('cartErrorMessage_gnl_txt');
          const cartSuccessMessage = cartErrorMsg + PEProcessingMessages;
          this.alertWithReturnToDashboard(this.translate.instant('error'), cartSuccessMessage);
        } else if (response.APIStatusReason === 'ERROR_PROCESSING_GUEST_PAYMENT_CONTACT_SUPPORT') {
          const cartErrorMsg = this.translate.instant('ERROR_PROCESSING_GUEST_PAYMENT_CONTACT_SUPPORT');
          const cartSuccessMessage = cartErrorMsg;
          // this.alertWithCloseButton('Error', cartSuccessMessage);
          this.alertService.alert(this.translate.instant('Warning'), '<p>' + cartErrorMsg + '</p>');
        } else if (response.APIStatusReason === 'ERROR_PROCESSING_PAYMENT_CONTACT_SUPPORT') {
          const cartErrorMsg = this.translate.instant('ERROR_PROCESSING_PAYMENT_CONTACT_SUPPORT');
          const cartSuccessMessage = cartErrorMsg;
          this.alertService.alert(this.translate.instant('Warning'),  '<p>' + cartErrorMsg + '</p>');
          // this.alertWithCloseButton('Error', cartSuccessMessage);
        } else if (response.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
          const cartErrorMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
          const cartSuccessMessage = cartErrorMsg;
          this.alertWithCloseButton(this.translate.instant('error'), cartSuccessMessage);
        } else {
          const cartSuccessMessage = this.translate.instant('cartErrorMessage_gnl_txt');
          this.alertWithCloseButton(this.translate.instant('error'), cartSuccessMessage);
        }
      } else if (response.APIStatusReason === 'INVALID_SPOTS') {
        const failurmsg1 = this.translate.instant('INVALID_SPOTS_1');
        const failurmsg2 = this.translate.instant('INVALID_SPOTS_2');
        let Spotfailurmsg = null;
        const SpotsExhaustLength = response.InvalidFee.length;
        if (SpotsExhaustLength === 1) {
          const removableCartItems = [];
          response.InvalidCartItems.forEach((responseData) => {
            if (responseData.IntPatronCartId) {
              this.cartItems.forEach((responseDetails, index) => {
                if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
                  removableCartItems.push(this.cartItems[index]);
                }
              });
  
            }
          });
          this.modalController.dismiss({
            removableCartItems,
            APIStatusReason: response.APIStatusReason
          });
        } else {
          const removableCartItems = [];
          response.InvalidCartItems.forEach((responseData) => {
            if (responseData.IntPatronCartId) {
              this.cartItems.forEach((responseDetails, index) => {
                if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
                  removableCartItems.push(this.cartItems[index]);
                }
              });
  
            }
          });
          this.modalController.dismiss({
            removableCartItems,
            APIStatusReason: response.APIStatusReason
          });
        }

        response.InvalidCartItems.forEach((responseData) => {
          if (responseData.IntPatronCartId) {
            this.cartItems.forEach((responseDetails, index) => {
              if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
                this.cartItems[index].isInvalidSpot = true;
              }
            });
          }
        });
        this.modalController.dismiss({
          cartItems: this.cartItems
        });
      } else if (response.APIStatusReason === 'ADJUSTMENT_MISMATCH' || response.APIStatusReason === 'INVALID_CART_ITEMS') {
        const PEProcessingMessages = '- ' + this.translate.instant(response.APIStatusReason);
        const cartErrorMsg = this.translate.instant('cartErrorMessage_gnl_txt');
        const cartSuccessMessage = cartErrorMsg + PEProcessingMessages;
        this.alertWithCloseButton('Error', cartSuccessMessage); // call patron list
      } else if (response.APIStatusReason === 'ATTRIBUTE_NOT_AVAILABLE' ||
                 response.APIStatusReason === 'INVALID_INTFEEADVANCEATTRIBUTEID' ||  response.APIStatusReason === 'EXPIRED_END_DATE') {
        const removableCartItems = [];
        // if (!this.isGuestCheckout) {
        //   this.modalController.dismiss();
        // }
        response.InvalidCartItems.forEach((responseData) => {
          if (responseData.IntPatronCartId) {
            this.cartItems.forEach((responseDetails, index) => {
              if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
                removableCartItems.push(this.cartItems[index]);
              }
            });

          }
        });
        this.modalController.dismiss({
          removableCartItems,
          APIStatusReason: response.APIStatusReason
        });
        
      } else if (response.APIStatusReason === 'INVALID_INTFEEADVANCEATTRIBUTEID') {
      const removableCartItems = [];
      // if (!this.isGuestCheckout) {
      //   this.modalController.dismiss();
      // }
      response.InvalidCartItems.forEach((responseData) => {
      if (responseData.IntPatronCartId) {
      this.cartItems.forEach((responseDetails, index) => {
        if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
          removableCartItems.push(this.cartItems[index]);
        }
      });

      }
      });
      this.modalController.dismiss({
      removableCartItems,
      APIStatusReason: response.APIStatusReason
      });

      }else if (response.APIStatusReason === 'EXPIRED_END_DATE' || response.APIStatusReason === 'INVALID_ASSIGNEDFEE') {
        const removableCartItems = [];
        // if (!this.isGuestCheckout) {
        //   this.modalController.dismiss();
        // }
        response.InvalidCartItems.forEach((responseData) => {
        if (responseData.IntPatronCartId) {
        this.cartItems.forEach((responseDetails, index) => {
          if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
            removableCartItems.push(this.cartItems[index]);
          }
        });
  
        }
        });
        this.modalController.dismiss({
        removableCartItems,
        APIStatusReason: response.APIStatusReason
        });
  
        } else if (response.APIStatus === 'Invalid') {
        const removableCartItems = [];
        response.InvalidCartItems.forEach((responseData) => {
          if (responseData.IntPatronCartId) {
            this.cartItems.forEach((responseDetails, index) => {
              if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
                removableCartItems.push(this.cartItems[index]);
              }
            });
          }
        });
        if (response.APIStatusReason === 'MEAL_CART_AMOUNT_INVALID') {
          const subHeader = this.translate.instant('check_out_Errormessage');
          const mealError1 = this.translate.instant('mealError_1');
          const mealError2 = this.translate.instant('mealError_2');
          const cartSuccessMessage = mealError1 + '$' + this.totalLunchLimit + mealError2 + this.translate.instant('checkoutError1');
          this.alertWithReturnToCart(this.translate.instant('error'), subHeader, cartSuccessMessage);
        }
        if (response.APIStatusReason === 'FUND_CART_AMOUNT_INVALID') {
          const subHeader = this.translate.instant('check_out_Errormessage');
          const fundError1 = this.translate.instant('fundError_1');
          const fundError2 = this.translate.instant('fundError_2');
          const cartSuccessMessage = fundError1 + '$' + this.totalFundLimit + fundError2 + this.translate.instant('checkoutError1');
          this.alertWithReturnToCart(this.translate.instant('error'), subHeader, cartSuccessMessage);
        }
        if (response.APIStatusReason === 'MEAL_AND_FUND_CART_AMOUNT_INVALID') {
          const subHeader = this.translate.instant('check_out_Errormessage');
          const mealError1 = this.translate.instant('mealError_1');
          const fundError1 = this.translate.instant('fundError_1');
          const fundError2 = this.translate.instant('fundError_2');
          const cartSuccessMessage = mealError1 + '$' + this.totalLunchLimit + this.translate.instant('and') +
          fundError1 + '$' + this.totalFundLimit + fundError2 + this.translate.instant('checkoutError1');
          this.alertWithReturnToCart(this.translate.instant('error'), subHeader, cartSuccessMessage);
        }

        this.modalController.dismiss({
          removableCartItems,
        });
      } else {
        const PEProcessingMessages = '- ' + this.translate.instant(response.APIStatusReason);
        const cartSuccessMessage = this.translate.instant('cartErrorMessage_txt') + PEProcessingMessages;
        this.alertWithCloseButton(this.translate.instant('error'), cartSuccessMessage); // call patron list
      }

    }
  }
  alertWithReturnToCart(header, subHeader, message ) {
    const alert = this.alertController.create({
      header,
      subHeader,
      message,
      buttons: [{
        text: this.translate.instant('Return_To_Cart'),
        handler: () => {
          this.modalController.dismiss();
        }
      }]
    });
    alert.then((res) => {
      res.present();
    });
  }
  afterZeroProcessCart(response) {
    let errorCount = 0;
    if (response.Transactions > 0) {
      errorCount = response.Transactions.filter(s => s.Status !== 'S');
    } else {
      errorCount = 0;
    }
    if (response.APIStatus === 'Success' && errorCount === 0) {
      response = response;
      this.intTransactionID = response.Transactions[0].IntTransactionId;
      this.siteID = response.Transactions[0].SiteId;
      const totalAmount = Number(response.Total).toFixed(2);
      const cartSuccessMessage = this.translate.instant('cartSuccessMessage_txt1') + totalAmount +
                                 this.translate.instant('cartSuccessMessage_txt2');
      this.alertWithReturnToDashboard(this.translate.instant('IS_Success'), cartSuccessMessage);
    } else {
      let PEProcessingMessages: any;
      let genericMsg: any;
      if (response.APIStatus === 'Success') {
        PEProcessingMessages = '- ' + response.PEProcessingMessages[0];
        this.alertWithReturnToDashboard(this.translate.instant('IS_Success'), PEProcessingMessages);
      } else if (response.APIStatusReason === 'INACTIVE_PATRON') {
        PEProcessingMessages = this.translate.instant(response.APIStatusReason);
        genericMsg = ' ';
      } else if (response.APIStatusReason === 'MERCHANT_ACCOUNT_NOT_FOUND') {
        PEProcessingMessages = ' - ' + this.translate.instant(response.APIStatusReason);
        genericMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
      } else if (response.APIStatusReason === 'ADJUSTMENT_MISMATCH' || response.APIStatusReason === 'INVALID_CART_ITEMS') {
        PEProcessingMessages = '- ' + this.translate.instant(response.APIStatusReason);
        genericMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
      } else if (response.APIStatusReason === 'INVALID_ZERO_DOLLAR_ITEM') {
        genericMsg = this.translate.instant('ERROR_CONTACT_SUPPORT_1');
      } else {
        PEProcessingMessages = '- ' + this.translate.instant(response.APIStatusReason);
        genericMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
      }
      const failurmsg = genericMsg + PEProcessingMessages;
      this.alertWithCloseButton(this.translate.instant('error'), failurmsg);
    }
  }

  alertWithReturnToDashboard(header, message) {
    if (!this.isGuestCheckout) {
      this.modalController.dismiss();
    }
    const buttonName: any = this.translate.instant('print_receipt');
    const buttonName2: any = this.isGuestCheckout ? this.translate.instant('Back') : this.translate.instant('return_to_dashboard');
    const alert = this.alertController.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: buttonName,
          handler: () => {

            const payload: any = {
              IntTransactionId: this.intTransactionID,
              SiteId: this.siteID
            };
            this.sharedService.loading.next(true);
            this.dataService.getReceipt(payload).subscribe((data: any) => {
              if (data !== undefined) {
                console.log(data, 'receipt response');
                this.paymentReceipt = data.body.ReceiptData;
                data.body.IntTransactionId = this.intTransactionID;
                this.sharedService.setReceiptData(data,);
                this.sharedService.loading.next(false);
                if(this.isGuestCheckout){
                  this.router.navigate(['fundraiserfee/payment-reciept'], {
                    skipLocationChange: true,
                  });
                }else{
                  this.router.navigate(['/dashboard/payment-reciept'], {
                    skipLocationChange: true,
                  });
                }
              }
            });
          }
        },
        {
          text: buttonName2,
          handler: () => {
            if (this.isGuestCheckout) {
              this.router.navigate(['fundraiserfee/fundraiser-fees'], {
                skipLocationChange: true,
              });
            } else {
              // const redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
              this.sharedService.cartCount.next(0);
              this.navCtrl.navigateRoot('/dashboard/home');
            }
          }
        }]
    });
    alert.then((res) => {
      res.present();
    });
  }


  downloadFile(data) {
    this.downloading = true;
    const fileName = 'Receipt.pdf';
    let extNameformate;
    let imgdata;
    const filepath = this.file.cacheDirectory + 'Attachments/' + fileName;
    extNameformate = 'application/pdf';
    imgdata = 'data:application/pdf;base64,' + data;

    const realData = imgdata.split(',')[1];
    const blob = this.b64toBlob(realData, extNameformate);

    this.file.checkDir(this.file.cacheDirectory, 'Attachments')
      .then(result => {
        this.file.writeFile(this.file.cacheDirectory + 'Attachments/', fileName, blob, { replace: true }).then(response => {
          this.downloading = false;
          this.fileOpener.open(filepath, extNameformate)
            .then(() => {

            })
            .catch(e => console.log('Error opening file', e));
        }).catch(err => {
          this.downloading = false;
        });
      })
      .catch(err => {
        this.file.createDir(this.file.cacheDirectory, 'Attachments', false).then(result => {
          this.file.writeFile(this.file.cacheDirectory + 'Attachments/', fileName, blob, { replace: true }).then(response => {
            this.downloading = false;
            this.fileOpener.open(filepath, extNameformate)
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error opening file', e));
          }).catch(err => {
            this.downloading = false;

          });
        }).catch(err => {
          this.downloading = false;
        });
      });
  }
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  alertWithDashboardCartButton(header, message) {
    // this.modalController.dismiss();
    const buttonOneText: string = this.isGuestCheckout ? this.translate.instant('BACK') : this.translate.instant('Return_To_Cart');
    if (this.isGuestCheckout) {
      const alert = this.alertController.create({
        header: header,
        message: message,
        backdropDismiss: false,
        buttons: [
          {
          text: buttonOneText,
          handler: () => {
              this.router.navigate(['fundraiserfee/fundraiser-fees'],{
                skipLocationChange: true,
              });
              
            }
          }
        ]
      });
      alert.then((res) => {
        res.present();
      });
    } else {
      const alert = this.alertController.create({
        header: header,
        message: message,
        backdropDismiss: false,
        buttons: [
          {
          text: buttonOneText,
          handler: () => {
            this.onDismiss();
            this.router.navigate(['/dashboard/cart'],{
              skipLocationChange: true,
            });
            
            }
          },
          {
            text: this.translate.instant('Return_To_ManagePayments'),
            handler: () => {
              this.onDismiss();
              this.router.navigate(['/dashboard/manage-payment-methods'],{
                skipLocationChange: true,
              });
            }
          }
        ]
      });
      alert.then((res) => {
        res.present();
      });
    }
  }

  alertWithCloseButton(header, message) {
    const alert = this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: this.translate.instant('close'),
        handler: () => {
          // call patron list
          this.modalController.dismiss();
        }
      }]
    });
    alert.then((res) => {
      res.present();
    });
  }

  failureToast(message) {
    const alert = this.alertController.create({
      message: message,
      buttons:  [{
      text: this.translate.instant('ok'),
      role: 'cancel',
      handler: () => {
        this.sharedService.refreshCart.next(true);
      }}]
    });
    alert.then((res) => {
      res.present();
    });
  }
}

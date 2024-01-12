import { CheckoutPage } from './../checkout/checkout.page';
import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, NavParams, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CC, ACH } from './../../services/data/model/manage-payment-methods';
import { NgForm } from '@angular/forms';
import { SharedService } from 'src/app/services/shared/shared.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { DataService } from 'src/app/services/data/data.service';
import { Router } from '@angular/router';
import { LanguageService } from 'src/app/services/language/language.service'; 

@Component({
  selector: 'app-use-new-card',
  templateUrl: './use-new-card.page.html',
  styleUrls: ['./use-new-card.page.scss'],
})
export class UseNewCardPage implements OnInit {
  card: CC;
  maxLength = 16;
  CVV = 4;
  isSaveCardChecked = false;
  expirationMonth: string;
  expirationYear: string;
  isExpiredDateInvalid = false;
  currentyear: string;
  cartItems: any;
  cartData: any;
  Email:any;
  isGuest = false;
  IntPatronCartId: any;

  constructor(private modalController: ModalController,
    private translate: TranslateService,
    private sharedService: SharedService,
    private dataService: DataService,
    public alertService: AlertService,
    private alertController: AlertController,
    public languageService: LanguageService,
    private router: Router,
    navParams: NavParams,
    private toastController: ToastController) {
    this.card = {
      "NickName": "",
      "Default": false,
      "FirstName": "",
      "LastName": "",
      "Address1": "",
      "Address2": "",
      "State": "",
      "City": "",
      "PostalCode": "",
      "CountryCode": "",
      "Number": "",
      "ExpirationMonth": "",
      "ExpirationYear": "",
      "Cvv": "",
      "expdate": ""
    }
    this.cartItems = navParams.get('Data').cartItems;
    this.cartData = navParams.get('Data').cartData;
    this.Email = navParams.get('Data').Email;
    this.IntPatronCartId = navParams.get('Data').IntPatronCartId;
  }

  ngOnInit() {
    this.currentyear = (new Date()).getFullYear().toString();
    this.isGuest = this.sharedService.isGuestUser;
    let guestmail = sessionStorage.getItem('Email');
    if(guestmail){
      this.isGuest = true;
    }
  }

  ionViewWillEnter() {
    this.sharedService.refreshCart.next(false);
  }

  getRequestObject(formData: NgForm) {
    if (this.isGuest === false) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const formValue = formData.value;
      const obj = {
        "NickName": formValue.NickName,
        "Default": false,
        "FirstName": userInfo.FirstName,
        "LastName": userInfo.LastName,
        "Address1": userInfo.Address1,
        "Address2": userInfo.Address2,
        "State": userInfo.State,
        "City": userInfo.City,
        "PostalCode": userInfo.PostalCode,
        "CountryCode": userInfo.CountryCode,
        "Number": formValue.Number,
        "ExpirationMonth": formValue.expdate.split("/")[0],
        "ExpirationYear": '20' + formValue.expdate.split("/")[1],
        "Cvv": formValue.Cvv,
      };
      return obj;
    } else {
      const formValue = formData.value;
      const obj = {
        "FirstName": formValue.FirstName,
        "LastName": formValue.LastName,
        "Number": formValue.Number,
        "ExpirationMonth": formValue.expdate.split('/')[0],
        "ExpirationYear": '20' + formValue.expdate.split('/')[1],
        "Cvv": formValue.Cvv,
        "NickName" : '',
        "IntPatronCartId": this.IntPatronCartId
      };
      return obj;
    }
  }

  onCardNumberchange(data) {
    if (data) {
      if (data.substring(0, 1) === '3') {
        this.maxLength = 15;
        this.CVV = 4;
      } else if (data.substring(0, 1) === '4' || data.substring(0, 1) === '5' || data.substring(0, 1) === '6') {
        this.maxLength = 16;
        this.CVV = 3;
      }
      this.card.Cvv = ''
    }
  }



  onCardExpdatechange(data) {
    if (data) {
      this.card.expdate = data.replace(/^(\d\d)(\d)$/g, '$1/$2').replace(/^(\d\d\/\d\d)(\d+)$/g, '$1/$2').replace(/[^\d\/]/g, '')
      let text = this.card.expdate;
      if (text.length == 5) {
        this.expirationMonth = text.split("/")[0];
        this.expirationYear = text.split("/")[1];

        let currentYear = new Date().getFullYear().toString().slice(-2);
        let currentMonth = (new Date().getMonth() + 1).toString();
        let enteredYear = Number(this.expirationYear);
        let enteredMonth = Number(this.expirationMonth);
        let systemYear = Number(currentYear);
        let systemMonth = Number(currentMonth);

        if (enteredYear >= systemYear && enteredMonth <= 12 && enteredMonth > 0) {
          if (systemYear === enteredYear && enteredMonth >= systemMonth) {
            this.isExpiredDateInvalid = false;
          } else if (systemYear < enteredYear && systemMonth <= 12) {
            this.isExpiredDateInvalid = false;
          } else {
            this.isExpiredDateInvalid = true; // Show alert
          }
        } else {
          this.isExpiredDateInvalid = true; // Show alert
        }
      }
    }
  }

  async onSubmit(formData: NgForm) {
    const reqObj: any = this.getRequestObject(formData);
    const paymentData = {
      PaymentType: 'CC'
    }
    const obj = {
      "cardType": 'tempCard',
      "tempCardReqObj": reqObj,
      "isSaveCardChecked": this.isSaveCardChecked,
      "selectedPaymentMethodID": '',
      "cartData": this.cartData,
      "cartItems": this.cartItems,
      "paymentData": paymentData,
      "Email": this.Email
    }


    this.modalController.dismiss();
    const modal = await this.modalController.create({
      component: CheckoutPage,
      componentProps: {
        Data: obj
      }
    });
    modal.onDidDismiss()
      .then((dismissData) => {
        if (dismissData.data) {
          this.cartItems = dismissData.data;
        }
      });
    return await modal.present();
    // if (this.isSaveCardChecked) {
    //   this.addTempCreditCard(formData, reqObj);
    // } else {
    //   const cartArray = [];

    //   this.cartItems.forEach((cartItem) => {
    //     const obj = {
    //       "IntPatronCartId": cartItem.IntPatronCartId,
    //       "AdjustedAmountDue": cartItem.AdjustedAmountDue ? cartItem.AdjustedAmountDue : null,
    //       "CartAmount": cartItem.CartAmount
    //     }
    //     cartArray.push(obj);
    //   })
    //   reqObj.CartItems = cartArray;
    //   this.processTempCard(reqObj);
    // }
  }

  // addTempCreditCard(formData: NgForm, reqObject) {

  //   this.sharedService.loading.next(true);
  //   this.dataService.addCreditCard(reqObject)
  //     .subscribe(
  //       (response: any) => {
  //         this.sharedService.loading.next(false);
  //         if (response.body.APIStatus == 'Success' && response.status == 200) {
  //           this.alertService.successToast(this.translate.instant('Payment_added_successfully'));
  //           formData.reset();
  //           const cartArray = [];

  //           this.cartItems.forEach((cartItem) => {
  //             const obj = {
  //               "IntPatronCartId": cartItem.IntPatronCartId,
  //               "AdjustedAmountDue": cartItem.AdjustedAmountDue ? cartItem.AdjustedAmountDue : null,
  //               "CartAmount": cartItem.CartAmount
  //             }
  //             cartArray.push(obj);
  //           })
  //           reqObject.CartItems = cartArray;
  //           this.processTempCard(reqObject);
  //         } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
  //           const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
  //           this.alertService.failureToast(message);
  //         } else {
  //           const message = this.translate.instant('error_due_to');
  //           this.alertService.checkPEProcessingMessages(response.body, message);
  //         }
  //       },
  //       (error) => {
  //         this.sharedService.loading.next(false);
  //         console.log(error);
  //       }
  //     );
  // }

  // processTempCard(reqObject) {
  //   this.sharedService.loading.next(true);
  //   this.alertService.cartLoader();
  //   this.dataService.processTempCreditCard(reqObject)
  //     .subscribe(
  //       (response: any) => {
  //         this.sharedService.loading.next(false);
  //         this.alertService.cartLoaderDismiss();
  //         this.afterProcessCart(response.body, 'CC');
  //       },
  //       (error) => {
  //         this.sharedService.loading.next(false);
  //         this.alertService.cartLoaderDismiss();
  //         console.log(error);
  //       }
  //     );
  // }

  // afterProcessCart(response, PaymentType) {
  //   // this.IsLoadingVisible = true;
  //   let errorCount = 0;
  //   if (response.Transactions > 0) {
  //     errorCount = response.Transactions.filter(s => s.Status != 'S');
  //   }
  //   else {
  //     errorCount = 0;
  //   }
  //   if (response.APIStatus === 'Success' && errorCount == 0) {

  //     const totalAmount = Number(response.Total).toFixed(2);
  //     const cartSuccessMessage = this.translate.instant('cartSuccessMessage_txt1') + totalAmount + this.translate.instant('cartSuccessMessage_txt2');
  //     this.alertWithReturnToDashboard('Success', cartSuccessMessage);
  //   } else {

  //     if (response.APIStatus === 'Success') {
  //       const PEProcessingMessages = "- " + response.PEProcessingMessages[0];
  //       const cartSuccessMessage = this.translate.instant('cartErrorMessage_txt') + PEProcessingMessages;
  //       this.alertWithReturnToDashboard('Success', cartSuccessMessage);
  //     } else if (response.APIStatus === 'Error') {
  //       let peMsgs = ''
  //       if (response.PEProcessingMessages != null && response.PEProcessingMessages.length > 0) {
  //         let peMsgArray = response.PEProcessingMessages;
  //         peMsgs = peMsgArray.join(",")
  //         peMsgs = peMsgs.slice(0, -1);
  //         const cartErrorMsg = this.translate.instant('check_out_Errormessage');
  //         const m1 = cartErrorMsg + " - " + peMsgs;
  //         const m2 = this.translate.instant('check_out_paymentdeclined');
  //         const message = '<p>' + m1 + '</p><p>' + m2 + '</p>';
  //         this.alertWithDashboardCartButton('Error', message);
  //       } else if (response.APIStatusReason === 'MERCHANT_ACCOUNT_NOT_FOUND') {
  //         const PEProcessingMessages = " - " + this.translate.instant(response.APIStatusReason);
  //         const cartErrorMsg = this.translate.instant('cartErrorMessage_gnl_txt');
  //         const cartSuccessMessage = cartErrorMsg + PEProcessingMessages;
  //         this.alertWithReturnToDashboard('Error', cartSuccessMessage);
  //       } else if (response.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
  //         const cartErrorMsg = this.translate.instant('ERROR_CONTACT_SUPPORT');
  //         const cartSuccessMessage = cartErrorMsg;
  //         this.alertWithCloseButton('Error', cartSuccessMessage);
  //       } else {
  //         const cartSuccessMessage = this.translate.instant('cartErrorMessage_gnl_txt');
  //         this.alertWithCloseButton('Error', cartSuccessMessage);
  //       }
  //     } else if (response.APIStatusReason === 'INVALID_SPOTS') {
  //       const failurmsg_1 = this.translate.instant('INVALID_SPOTS_1');
  //       const failurmsg_2 = this.translate.instant('INVALID_SPOTS_2');
  //       let Spotfailurmsg = null;
  //       var SpotsExhaustLength = response.InvalidFee.length;
  //       if (SpotsExhaustLength == 1) {
  //         response.InvalidFee.forEach((responseValue) => {
  //           var totalSpots = responseValue.Spots;
  //           Spotfailurmsg = failurmsg_1 + totalSpots + failurmsg_2;
  //         })
  //         this.failureToast(Spotfailurmsg);
  //       } else {
  //         const Spotfailurmsg = this.translate.instant('INVALID_MULTIPLE_SPOTS');
  //         this.failureToast(Spotfailurmsg);
  //       }

  //       response.InvalidCartItems.forEach((responseData) => {
  //         if (responseData.IntPatronCartId) {
  //           this.cartItems.forEach((responseDetails, index) => {
  //             if (responseDetails.IntPatronCartId === responseData.IntPatronCartId) {
  //               this.cartItems[index].isInvalidSpot = true;
  //             }
  //           });
  //         }
  //       });
  //       this.modalController.dismiss(this.cartItems);

  //     } else if (response.APIStatusReason === 'ADJUSTMENT_MISMATCH' || response.APIStatusReason === 'INVALID_CART_ITEMS') {
  //       const PEProcessingMessages = "- " + this.translate.instant(response.APIStatusReason);
  //       const cartErrorMsg = this.translate.instant('cartErrorMessage_gnl_txt');
  //       const cartSuccessMessage = cartErrorMsg + PEProcessingMessages;
  //       this.alertWithCloseButton('Error', cartSuccessMessage); // call patron list
  //     } else {
  //       const PEProcessingMessages = "- " + this.translate.instant(response.APIStatusReason);
  //       const cartSuccessMessage = this.translate.instant('cartErrorMessage_txt') + PEProcessingMessages;
  //       this.alertWithCloseButton('Error', cartSuccessMessage); // call patron list
  //     }
  //   }
  // }

  // alertWithReturnToDashboard(header, message) {
  //   this.modalController.dismiss();
  //   const alert = this.alertController.create({
  //     header: header,
  //     message: message,
  //     backdropDismiss: false,
  //     buttons: [{
  //       text: this.translate.instant('return_to_dashboard'),
  //       handler: () => {
  //         this.router.navigate(['/dashboard']);
  //       }
  //     }]
  //   });
  //   alert.then((res) => {
  //     res.present();
  //   })
  // }

  // alertWithDashboardCartButton(header, message) {
  //   this.modalController.dismiss();
  //   const alert = this.alertController.create({
  //     header: header,
  //     message: message,
  //     backdropDismiss: false,
  //     buttons: [{
  //       text: this.translate.instant('Return_To_Cart'),
  //       handler: () => {
  //         this.router.navigate(['/dashboard/cart']);
  //       }
  //     }, {
  //       text: this.translate.instant('Return_To_ManagePayments'),
  //       handler: () => {
  //         this.router.navigate(['/dashboard/manage-payment-methods']);
  //       }
  //     }]
  //   });
  //   alert.then((res) => {
  //     res.present();
  //   })
  // }

  // alertWithCloseButton(header, message) {
  //   const alert = this.alertController.create({
  //     header: header,
  //     message: message,
  //     buttons: [{
  //       text: this.translate.instant('close'),
  //       handler: () => {
  //         // call patron list
  //         this.modalController.dismiss();
  //       }
  //     }]
  //   });
  //   alert.then((res) => {
  //     res.present();
  //   })
  // }


  onDismiss() {
    this.modalController.dismiss()
      .then((data) => {
      });
  }

  onClear(f: NgForm) {
    f.reset();
  }

  // failureToast(message) {
  //   const toast = this.toastController.create({
  //     message: message,
  //     color: 'danger',
  //     position: 'top',
  //     keyboardClose: true,
  //     animated: true,
  //     buttons: [
  //       {
  //         side: 'end',
  //         text: this.translate.instant('ok_button'),
  //         handler: () => {
  //           this.sharedService.refreshCart.next(true);
  //         }
  //       }
  //     ]
  //   });
  //   toast.then((reason) => {
  //     reason.present();
  //   })
  // }
}

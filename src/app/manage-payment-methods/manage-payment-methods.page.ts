import { SharedService } from './../services/shared/shared.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, MenuController,Platform } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { TabHeaderService } from './../services/tab-header/tab-header.service';
import { CC, ACH } from './../services/data/model/manage-payment-methods';
import { DataService } from './../services/data/data.service';
import { Router, ActivatedRoute } from '@angular/router';
// import { CardIO } from '@ionic-native/card-io/ngx';
import { AlertService } from './../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './../auth/auth.service';
import { LanguageService } from './../services/language/language.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
declare var CardIO:any;

@Component({
  selector: 'app-manage-payment-methods',
  templateUrl: './manage-payment-methods.page.html',
  styleUrls: ['./manage-payment-methods.page.scss'],
})
export class ManagePaymentMethodsPage implements OnInit {
  anio: number = new Date().getFullYear();
  position:string = 'stacked';
  category = 'Add';
  cardType = 0;
  paymenttype: string;
  card: CC;
  account: ACH;
  maxLength = 16;
  CVV = 4;
  expirationMonth: string;
  expirationYear: string;
  currentyear: string;
  paymentMethods: any;
  phase: string;
  patronsCount;
  displayDefaultLabel = false;
  isTermsChecked = false;
  isExpiredDateInvalid = false;
  cartCount: number;
  fullPaymentMethodData: any;
  maxlengthNickname: number = 30;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  tabHeaderValues = {
    'screenName': ' '
  };

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    private sharedService: SharedService,
    public toastController: ToastController,
    private router: Router,
    // private cardIO: CardIO,
    public alertService: AlertService,
    private translate: TranslateService,
    private authService: AuthService,
    public languageService: LanguageService,
    private menu: MenuController,
    private route: ActivatedRoute,
    private androidPermissions: AndroidPermissions
  ) {
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
    this.account = {
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
      "RoutingNumber": "",
      "AccountNumber": "",
      "AccountType": ""
    }
  }

  ngOnInit() {
    this.sharedService.appPhase.subscribe((phase) => {
      this.phase = phase;
      if (this.phase == 'dashboard') {
        this.category = 'View';
      } else if (this.phase == 'registrationPhase') {
        this.sharedService.getUserInformation();
        this.category == 'Add'
      }
    })
    this.currentyear = (new Date()).getFullYear().toString();
  }

  ionViewWillEnter() {
    let tabeType = this.route.snapshot.queryParams["page"];
    if (tabeType == 'add') {
      const ev = {
        detail: {
          value: 'Add'
        }
      }
      this.segmentChanged(ev);
      this.category == 'Add'
    }
    const userInfo = this.sharedService.getUserInfo();
    if (!userInfo) {
      this.getUserInfo();
    }
    this.getPaymentMethods();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  changeTabTo(tabnum) {
    this.tabHeaderService.redirectToPage(tabnum);
  }

  segmentChanged(event) {
    this.position = 'fixed';
    if (event == 'View') {
      this.category = event;
    } else {
      this.cardType = 0;
      this.category = event.detail.value;
    }

    if (this.category == 'View') {
      this.getPaymentMethods();
    }
  }
  onCardTypeChange(type) {
    this.position = 'floating'
    this.isExpiredDateInvalid = false;
  }
  async infoAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('info'),
      message: this.translate.instant('info_message'),
      buttons: [this.translate.instant('ok')]
    });
    await alert.present();
  }

  async achTermsAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('ach_alert_header'),
      message: this.translate.instant('ach_alert_message'),
      buttons: [this.translate.instant('ok')]
    });
    await alert.present();
  }

  async ccTermsAlert() {
    const alert = await this.alertController.create({
      header: this.translate.instant('creaditcard_alert_header'),
      message: this.translate.instant('creaditcard_message') + `<ion-row class="ion-justify-content-center card-img"> <ion-img class="custom-img" src="assets/images/all credit cards.png"></ion-img></ion-row>`,
      cssClass: "cctermsalert",
      buttons: [this.translate.instant('ok')]
    });
    await alert.present();
  }

  onAddPayment(formData: NgForm) {
    if (this.cardType == 1) {
      const reqObject = this.getRequestObject(formData, this.cardType);
      this.addCreditCard(formData, reqObject);
    } else if (this.cardType == 2) {
      const reqObject = this.getRequestObject(formData, this.cardType);
      this.addBankAccount(formData, reqObject);
    }
  }

  addCreditCard(formData: NgForm, reqObject) {
    this.sharedService.loading.next(true);
    this.dataService.addCreditCard(reqObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.alertService.successToast(this.translate.instant('Payment_added_successfully'));
            formData.resetForm({Default: false});
            this.cardType = 0;
            this.paymenttype = 'cc';
            this.getPaymentMethods();
          } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
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

  addBankAccount(formData: NgForm, reqObject) {
    this.sharedService.loading.next(true);
    this.dataService.addBankAccount(reqObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.alertService.successToast(this.translate.instant('Payment_added_successfully'));
            formData.resetForm({Default: false});
            this.cardType = 0;
            this.getPaymentMethods();
          } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
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

  getRequestObject(formData: NgForm, type) {
    const userInfo = this.sharedService.getUserInfo();
    const formValue = formData.value;
    const basicDetails = {
      "NickName": formValue.NickName,
      "Default": formValue.Default,
      "FirstName": userInfo.FirstName,
      "LastName": userInfo.LastName,
      "Address1": userInfo.Address1,
      "Address2": userInfo.Address2,
      "State": userInfo.State,
      "City": userInfo.City,
      "PostalCode": userInfo.PostalCode,
      "CountryCode": userInfo.CountryCode,
    }
    let ccDatails;
    let achDeatils;
    if (this.cardType == 1) {
      ccDatails = {

        "Number": formValue.Number,
        "ExpirationMonth": formValue.expdate.split("/")[0],
        "ExpirationYear": '20' + formValue.expdate.split("/")[1],
        "Cvv": formValue.Cvv,
      }
    } else {
      achDeatils = {
        "RoutingNumber": formValue.RoutingNumber,
        "AccountNumber": formValue.AccountNumber,
        "AccountType": formValue.AccountType,
      }
    }
    if (type == 1) {
      const obj = { ...basicDetails, ...ccDatails };
      return obj;
    } else {
      const obj = { ...basicDetails, ...achDeatils };
      return obj;
    }
  }

  getUserInfo() {
    this.sharedService.loading.next(true);
    this.dataService.getUserInfo()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.sharedService.setUserInfo(response.body);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);

        }
      );
  }

  onPaymentMethodChanged(formData: NgForm) {
    formData.resetForm({Default: false});
  }

  getPaymentMethods() {
    this.sharedService.loading.next(true);
    this.dataService.viewPaymentMethods()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const paymentMethods = response.body.PaymentMethods;

          const withoutDefaultPayment = paymentMethods.filter((paymentMethod) => {
            if (!paymentMethod.Default) {
              return paymentMethod;
            }
          })

          const withDefaultPayment = paymentMethods.filter((paymentMethod) => {
            if (paymentMethod.Default) {
              return paymentMethod;
            }
          })
          this.paymentMethods = withDefaultPayment.concat(withoutDefaultPayment);
          this.fullPaymentMethodData = withDefaultPayment.concat(withoutDefaultPayment);

          if (withDefaultPayment.length == 1) {
            this.displayDefaultLabel = true;
          } else {
            this.displayDefaultLabel = false;
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  setAsDefaultPayment(PaymentMethodId) {
    this.sharedService.loading.next(true);
    const reqObj = {
      PaymentMethodId: PaymentMethodId
    }
    this.dataService.setDefaultPaymentMethod(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success' && response.status == 200) {
            this.alertService.successToast(this.translate.instant('default_set_success'));
          } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
            const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
            this.alertService.failureToast(message);
          } else {
            const message = this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
          this.getPaymentMethods();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  setDefaultPopup(PaymentMethodId) {
    const alert = this.alertController.create({
      header: this.translate.instant('default'),
      message: this.translate.instant('default_msg'),
      buttons: [
        {
          text: this.translate.instant('no'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.sharedService.loading.next(true);
            this.paymentMethods = [];
            setTimeout(() => {
              this.sharedService.loading.next(false);
              this.paymentMethods = this.fullPaymentMethodData;
            }, 0);
          }
        }, {
          text: this.translate.instant('yes'),
          handler: () => {
            this.setAsDefaultPayment(PaymentMethodId);
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }


  presentAlertConfirm(paymentMethodId) {
    const alert = this.alertController.create({
      header: this.translate.instant('remove_payment_method'),
      message: this.translate.instant('confirm_message'),
      buttons: [
        {
          text: this.translate.instant('no'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: this.translate.instant('yes'),
          handler: () => {
            this.removePaymentMethod(paymentMethodId)
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }

  removePaymentMethod(paymentMethodId) {
    const reqObj = {
      PaymentMethodId: paymentMethodId
    }

    const selectedPaymentMethod = this.paymentMethods.filter((paymentMethod) => {
      if (paymentMethod.PaymentMethodId == paymentMethodId) {
        return paymentMethod;
      }
    })
    if (selectedPaymentMethod[0].ARMealsCardInUse || selectedPaymentMethod[0].ARFundCardInUse || selectedPaymentMethod[0].SPCardInUse) {
      const message = 'Your primary credit card (xxxx ' + selectedPaymentMethod[0].AccountNumber + ') is scheduled to be used for Auto replenishment payment/ a scheduled Payment. Please update your Auto Replenishment payment/scheduled payment  with a different payment before removing this payment method.';
      this.alertService.failureAlert(message);
    } else {
      this.dataService.removePaymentMethod(reqObj).subscribe((response: any) => {
        this.getPaymentMethods();
        this.alertService.successToast(this.translate.instant('paymentcard_remove'));
      })
    }
  }

  onSkipOrContinue(formData: NgForm, type) {
    if (formData.dirty && formData.valid && this.getStatus()) {
      this.changesNotSavedAlert(formData, 'skipcontinue', type);
    } else {
      if (type == 'skip') {
        this.redirect(formData);
      } else {
        if (this.category == 'Add') {
          const ev = {
            detail: {
              value: 'View'
            }
          }
          this.segmentChanged(ev);
        } else if (this.category == 'View') {
          this.redirect(formData);
        }
      }
    }
  }

  redirect(formData) {
    this.updateCurrentStep();
    const patronsInfo = this.sharedService.getPatronsInfo();
    if (!patronsInfo) {
      this.getUserPatrons();
    } else {
      if (patronsInfo.length > 0) {
        this.router.navigate(['/notifications']);
      } else {
        const updateStepreqObj = { "IntStepId": 6 };
        this.getUserPatrons();
        this.dataService.updateCurrentStep(updateStepreqObj)
          .subscribe(
            (updateResponse: any) => {
              sessionStorage.setItem('nextStep', JSON.stringify(''));
            }
          );
        this.router.navigate(['/dashboard']);
      }
    }
  }

  getUserPatrons() {
    this.dataService.viewUserPatron()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.patronsCount = response.body.Patrons;
          this.sharedService.setPatronsInfo(this.patronsCount);
          if (this.patronsCount.length > 0) {
            this.router.navigate(['/notifications']);
          } else {
            this.router.navigate(['/dashboard']); // Wehave to redirect to dashboard once its ready.
          }
        }
      )
  }

  updateCurrentStep() {
    const updateStepreqObj = { "IntStepId": 5 };
    this.dataService.updateCurrentStep(updateStepreqObj).subscribe((response: any) => {
      sessionStorage.setItem('nextStep', JSON.stringify('SetupNotifications'));
    });
  }

  onBack() {
    this.router.navigate(['/manage-patrons']);
  }

  onCardNumberchange(data) {
    if (data) {
      if (data.substring(0, 1) === "3") {
        this.maxLength = 15;
        this.CVV = 4;
      } else if (data.substring(0, 1) === "4" || data.substring(0, 1) === "5" || data.substring(0, 1) === "6") {
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
      }else{
        this.isExpiredDateInvalid = true;
      }
    }
  }

  onCamscan() {
    if(this.platform.is('ios')){
      this.ScanCard();         
    }else{
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => {
          if (!result.hasPermission) {
            this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA).then(result => {
              if (result.hasPermission) {
                this.ScanCard();
              }
            } )
           
          } else {
                  this.ScanCard();
               }
          },
          err => {
            console.error(err);
          }
      );
    }
  }

  ScanCard(){
    CardIO.scan({
      requireCVV: false,
      requirePostalCode: false,
      suppressManual: false,
      scanExpiry: true,
      keepApplicationTheme: true,
      guideColor: '#f79548',
      useCardIOLogo: true
              
    }, (response) => {
      this.card.Number = response.cardNumber;
}, (error) => {
  console.error('CardIO scan error', error);
});
  }
 

  onClearAll(f: NgForm) {
    this.isTermsChecked = false;
    f.resetForm({Default: false});
  }

  onLogout(formData: NgForm) {
    if (formData.dirty && formData.valid && this.getStatus()) {
      this.changesNotSavedAlert(formData, 'logout', '');
    } else {
      this.authService.logout('logout');
    }
  }

  onGotoCart(formData: NgForm) {
    if (formData.dirty && formData.valid && this.getStatus()) {
      this.changesNotSavedAlert(formData, 'cart', '');
    } else {
      this.router.navigate(['/dashboard/cart']);
    }
  }

  onGotoDashboard(formData: NgForm) {
    if (formData.dirty && formData.valid && this.getStatus()) {
      this.changesNotSavedAlert(formData, 'dashboard', '');
      return false;
    } else {
      this.router.navigate([this.redirectToDashboard]);
      return false;
    }
  }

  onLangChange(formData: NgForm) {
    this.languageService.displayLanguageAlert();
  }

  getStatus() {
    if (this.cardType == 0) {
      return false;
    } else if (this.cardType == 1) {
      const flag = (!!this.card.NickName && !!this.card.Number && !!this.card.Cvv && !!this.card.expdate && this.isTermsChecked);
      return flag;
    } else if (this.cardType == 2) {
      const flag = (!!this.account.NickName && !!this.account.RoutingNumber && !!this.account.AccountNumber && !!this.account.AccountType && this.isTermsChecked);
      return flag;
    }else{
      return false;
    }
  }


  onMenuClick(formData: NgForm, button) {
    this.getStatus();
    if (formData.dirty && formData.valid && this.getStatus()) {
      this.changesNotSavedAlert(formData, 'menu', '');
    }
  }

  changesNotSavedAlert(formData, button, type) {
    const alert = this.alertController.create({
      message: this.translate.instant('changes_not_saved'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          handler: (blah) => {
            if (button == 'menu') {
              this.menu.close();
            }
          }
        }, {
          text: this.translate.instant('Continue'),
          handler: () => {
            if (button == 'skipcontinue') {
              if (type == 'skip') {
                this.redirect(formData);
              } else {
                if (this.category == 'Add') {
                  const ev = {
                    detail: {
                      value: 'View'
                    }
                  }
                  this.segmentChanged(ev);
                } else if (this.category == 'View') {
                  this.redirect(formData);
                }
              }
            } else if (button == 'cart') {
              this.router.navigate(['/dashboard/cart']);
            } else if (button == 'logout') {
              this.authService.logout('logout');
            } else if (button == 'menu') {

            } else if(button == 'dashboard') {
              this.router.navigate([this.redirectToDashboard]);
            }
          }
        }]
    });

    alert.then((res) => {
      res.present();
    })
  }

}


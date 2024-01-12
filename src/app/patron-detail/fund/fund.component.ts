import { FundTransferPage } from './fund-transfer/fund-transfer.page';
import { AlertService } from './../../services/alert/alert.service';
import { AlertController, ModalController, Platform, NavController } from '@ionic/angular';
import { DataService } from './../../services/data/data.service';
import { SharedService } from 'src/app/services/shared/shared.service';
import { Router } from '@angular/router';
import { LanguageService } from './../../services/language/language.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FundDetails } from 'src/app/services/data/model/fund';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';

@Component({
  selector: 'app-fund',
  templateUrl: './fund.component.html',
  styleUrls: ['./fund.component.scss'],
})
export class FundComponent implements OnInit {
  fundLimit:any;
  selectedPatronData: any;
  fundCartItems: any;
  fundData: any;
  FirstName: string;
  LastName: string;
  Active: any;
  patrons: any;
  IntPatronId: any;
  data;
  isFundTransferFound: boolean = false;
  cartCount: number;
  paymentMethods: any;
  disableFlag = true;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  districtFeaturelist: any;

  constructor(private router: Router,
    public languageService: LanguageService, private translateService: TranslateService,
    private sharedService: SharedService,
    private dataService: DataService,
    private alertController: AlertController,
    private alertService: AlertService,
    private modalController: ModalController,
    private translate: TranslateService,
    private keyboard: Keyboard,
    private platform: Platform,
    private navCtrl: NavController) {

  }

  ngOnInit() {
    this.getPaymentMethod();
    this.keyboard.onKeyboardShow().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fund')) {
        let fundAlert = document.getElementsByTagName('ion-alert')[0];
        fundAlert.classList.add("custom_movealert");
      }
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fund')) {
        let fundAlert = document.getElementsByTagName('ion-alert')[0];
        fundAlert.classList.remove("custom_movealert");
      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserPatrons()    
   });
  }

  ionViewWillEnter() {
    this.getUserPatrons();
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.fundLimit = Number(this.districtFeaturelist.PaymentLimits.SourceAcctLimit).toFixed(2);
   // Number(data.ProcessingFee.TotalProcessingFee).toFixed(2);
    this.selectedPatronData = this.sharedService.getselectPatronWithData();
    const selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
    if (this.selectedPatronData && !selectedPatron) {
      localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
    } else {
      this.selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }

  getPaymentMethod() {
    this.sharedService.loading.next(true);
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          this.paymentMethods = response.body.PaymentMethods.length;
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  onGotoCart() {
    this.navCtrl.navigateRoot(['/dashboard/cart']);
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  onSelectedStudent(data) {
    this.selectedPatronData = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
    this.getCartItems();
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          const allStudentArray = [
            {
              "FirstName": this.translate.instant('All'),
              "LastName": this.translate.instant('Students'),
              "PictureData": "allStudentPicture",
              "IntPatronId": ""
            }
          ]
          this.sharedService.loading.next(false);
          const patrons = response.body.Patrons;
          const activePatrons = patrons.filter((patron) => {
            if (patron.Active == true) {
              return patron;
            }
          })
          if(activePatrons.length > 0) {
            this.disableFlag = false;
          } else {
            this.disableFlag = true;
          }
          if (patrons.length > 1) {
            this.patrons = allStudentArray.concat(patrons);
          } else {
            this.patrons = patrons;
          }
          if (this.selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == this.selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  if (this.widgetsContent) {
                    this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
                  }
                }, 2000)
              }
            })
          }
          this.getCartItems();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** get all cart items */
  getCartItems() {
    this.dataService.getCartItems()
      .subscribe(
        (response: any) => {
          this.sharedService.getCartCount(response);
          this.sharedService.loading.next(false);
          const cartItems = response.body.Patrons;
          const fundPaymentsModifiedArray = [];
          cartItems.forEach((cartItem) => {
            cartItem.SourceAccountPayments.forEach((Payment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntPatronAccountId": Payment.IntPatronAccountId,
                "FundName": Payment.FundName,
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "CartAmount": Payment.CartAmount,

              }
              fundPaymentsModifiedArray.push(obj);
            })
          })
          this.fundCartItems = fundPaymentsModifiedArray;
          if (this.selectedPatronData && this.selectedPatronData.type == 'individual') {
            this.getPatronSourceAccounts(this.fundCartItems);
            this.IntPatronId = this.selectedPatronData.data.IntPatronId;
          } else {
            this.getAllPatronSourceAccounts(this.fundCartItems);
            this.IntPatronId = "";
          }
        }
      )
  }

  /** get all patrons fund balances */
  getAllPatronSourceAccounts(fundCartItems) {
    this.dataService.getAllPatronSourceAccounts()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const patronsData = response.body.Patrons;
          const modifiedPatronsData = [];
          patronsData.forEach((data) => {
            data.SourceAccounts.forEach((SourceAccount) => {
              const obj = {
                "IntSiteId": data.IntSiteId,
                "SiteId": data.SiteId,
                "IntDistrictId": data.IntDistrictId,
                "IntPatronId": data.IntPatronId,
                "isPatronActive": this.getPatronStatus(data.IntPatronId),
                "PatronId": data.PatronId,
                "FirstName": data.FirstName,
                "LastName": data.LastName,
                "IntUserId": data.IntUserId,
                "Active": data.Active,
                "IntPatronAccountId": SourceAccount.IntPatronAccountId,
                "IntFundId": SourceAccount.IntFundId,
                "AccountName": SourceAccount.AccountName,
                "Balance": SourceAccount.Balance
              }
              modifiedPatronsData.push(obj);
            })
          })
          this.mergeFundAndCartData(fundCartItems, modifiedPatronsData);
          this.isFundtransferEnable(fundCartItems, modifiedPatronsData);
        }
      )
  }
  /** get individual patrons fund balances */
  getPatronSourceAccounts(fundCartItems) {
    let obj = {
      "IntSiteId": this.selectedPatronData.data.IntSiteId,
      "IntPatronId": this.selectedPatronData.data.IntPatronId,
    }
    this.dataService.getPatronSourceAccounts(obj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const modifiedPatronsData = [];
          const data = response.body;
          data.SourceAccounts.forEach((SourceAccount) => {
            const obj = {
              "IntSiteId": data.IntSiteId,
              "IntDistrictId": data.IntDistrictId,
              "IntPatronId": data.IntPatronId,
              "isPatronActive": this.getPatronStatus(data.IntPatronId),
              "IntUserId": data.IntUserId,
              "IntPatronAccountId": SourceAccount.IntPatronAccountId,
              "IntFundId": SourceAccount.IntFundId,
              "AccountName": SourceAccount.AccountName,
              "Balance": SourceAccount.Balance,
              "FirstName": this.FirstName,
              "LastName": this.LastName,
              "Active": this.Active
            }
            modifiedPatronsData.push(obj);
          })
          this.mergeIndividualFundAndCart(modifiedPatronsData, fundCartItems);
        }
      )
  }

  getPatronStatus(IntPatronId) {
    if (IntPatronId != '') {
      const filterredPatron = this.patrons.filter((patron) => {
        if (patron.IntPatronId == IntPatronId) {
          return patron;
        }
      })

      return filterredPatron[0].Active;
    } else {
      return true;
    }

  }

  /** merging cart data and individual patron balances for fund */
  mergeIndividualFundAndCart(fund, cartData) {
    fund.forEach((data) => {
      cartData.forEach((cartItem) => {
        if (data.IntPatronId == cartItem.IntPatronId && data.IntPatronAccountId == cartItem.IntPatronAccountId) {
          data.CartAmount = cartItem.CartAmount;
        }
      })
    })
    this.fundData = fund;
  }

  /** merging cart data and patron balances for fund */
  mergeFundAndCartData(fundCartItems, fundData) {
    fundData.forEach((fund) => {
      const filteredCartItem = fundCartItems.filter((cartItem) => {
        if (fund.IntPatronAccountId == cartItem.IntPatronAccountId && fund.IntPatronId == cartItem.IntPatronId) {
          return cartItem;
        }
      })
      if (filteredCartItem.length > 0) {
        fund.CartAmount = filteredCartItem[0].CartAmount;
        fund.IntPatronCartId = filteredCartItem[0].IntPatronCartId;
      }
    })
    this.fundData = fundData;
  }

  /** show popup on click of edit/add icons */
  async presentAlertConfirm(type, fundData) {
    const message = '<ion-grid><ion-row><ion-col size="6" class="header">' + this.translateService.instant('Name') + '</ion-col><ion-col size="6" class="header">' + this.translateService.instant('Balance') + '</ion-col></ion-row><ion-row><ion-col size="6">' + fundData.FirstName + " " + fundData.LastName + '</ion-col><ion-col size="6"> $' + fundData.Balance.toFixed(2) + '</ion-col></ion-row></ion-grid>'
    const alert = await this.alertController.create({
      message: message,
      cssClass: 'fund-popup-wrapper',
      inputs: [{
        name: 'amount',
        type: 'number',
        min: 0,
        value: fundData.CartAmount ? fundData.CartAmount.toFixed(2) : null,
        placeholder: this.translateService.instant('amount')
      }],
      buttons: [
        {
          text: this.translateService.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: this.translateService.instant('IS_Add_to_Cart'),
          handler: (data) => {
            var valid = !isNaN(data.amount);
            if (data.amount == '' || data.amount == 0 || !valid || data.amount.length > 15) {
              this.alertService.failureToast(this.translateService.instant('enter_valid_amt'));
              return false;
            } else {
              this.saveFundPayments(data.amount, fundData);
              return true;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /** save meal payments */
  saveFundPayments(amount, selectedFundData) {
    this.sharedService.loading.next(true);
    const obj = {
      "IntSiteId": selectedFundData.IntSiteId,
      "IntPatronId": selectedFundData.IntPatronId,
      "IntUserId": selectedFundData.IntUserId,
      "Active": selectedFundData.Active,
      "IntPatronAccountId": selectedFundData.IntPatronAccountId,
      "Amount": amount,
      "IntPatronCartId": selectedFundData.IntPatronCartId
    }
    this.dataService.SaveSourceAccountPayment(obj).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus == 'Success' && response.status == 200) {
        this.getCartItems();
      } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
        const message = this.translateService.instant('contact_support');
        this.alertService.failureToast(message);
      } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'PAYMENT_LIMIT_ERROR') {
        const message = this.translate.instant('fundError_1') + ' ' + '$' + ' ' + this.fundLimit + ' ' + this.translate.instant('fundError_2');
        this.alertService.failureToast(message);
      } else {
        const message = this.translateService.instant('error_due_to');
        this.alertService.checkPEProcessingMessages(response.body, message);
      }
    }, (error) => {
      this.sharedService.loading.next(false);
      console.log(error);
    })
  }

  isFundtransferEnable(fundDetailslist, fundTransferAccounts) {
    let sourceAccounts = []
    let fundDetails = new FundDetails();
    fundTransferAccounts.forEach((fundDetail, index) => {
      fundTransferAccounts.forEach((fundTransfer, index) => {
        if (fundDetail.AccountName == fundTransfer.AccountName && fundDetail.IntPatronId != fundTransfer.IntPatronId && fundDetail.Balance > 0) {
          this.isFundTransferFound = true;
        }
      });
    });
  }

  async onFundTransfer(data) {
    const patrondetails = JSON.parse(localStorage.getItem('selectedPatron'))
    if (this.isFundTransferFound === true) {
      this.showFundTransferPopUp(patrondetails);
    } else {
      this.showInstruction();
    }
  }

  async showFundTransferPopUp(patrondetails) {
    if (patrondetails.data !== '') {
      this.data = {
        "Type": 'FundTransfer',
        "PatronDetails": patrondetails.data.IntPatronId,
      }
    }
    else {
      this.data = {
        "Type": 'FundTransfer',
        "PatronDetails": '',
      }
    }

    this.sharedService.setFundTransfer(this.data);
    const modal = await this.modalController.create({
      component: FundTransferPage,
      componentProps: {
        Data: patrondetails,
        patronData: JSON.parse(localStorage.getItem('selectedPatron'))
      }
    });
    return await modal.present();
  }

  showInstruction() {
    const popHeading = this.translateService.instant('IS_Fund_Account_notify_title');
    const fundContent = this.translateService.instant('IS_Fund_Account_notify_content');
    const fundContent2 = this.translateService.instant('IS_Fund_Account_notify_content2');
    const fundContent3 = this.translateService.instant('IS_Fund_Account_notify_content3');
    const fundContent4 = this.translateService.instant('IS_Fund_Account_notify_content4');

    const message = fundContent + fundContent2 + fundContent3 + fundContent4;

    this.alertService.alert(popHeading, message);
  }

  OnInfoClick() {
    const message = '<ion-grid><ion-row><ion-col size="12"><p>' + this.translateService.instant('IS_Fund_Account_notify_content') + ':</p><p>'+this.translateService.instant('IS_Fund_Account_notify_content2')+'</p><p>'+this.translateService.instant('IS_Fund_Account_notify_content3')+'</p><p class="custom-space">'+this.translateService.instant('IS_Fund_Account_notify_content4')+'</p></ion-col></ion-row></ion-grid>'
    const alert = this.alertController.create({
      header: this.translate.instant('information_fund'),
      message: message,
      buttons: [this.translate.instant('ok')]
    });

    alert.then((res) => {
      res.present();
    })
  }
}

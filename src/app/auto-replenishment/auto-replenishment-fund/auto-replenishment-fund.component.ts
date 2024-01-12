import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AddAutoReplenishment, Denominations, Amount } from '../model/auto-replenishment';
import { LanguageService } from 'src/app/services/language/language.service';
import { SharedService } from 'src/app/services/shared/shared.service';
import { ModalController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data/data.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AutoReplenishmentTermsPage } from 'src/app/auto-replenishment-terms/auto-replenishment-terms.page';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';

register();
@Component({
  selector: 'app-auto-replenishment-fund',
  templateUrl: './auto-replenishment-fund.component.html',
  styleUrls: ['./auto-replenishment-fund.component.scss'],
})
export class AutoReplenishmentFundComponent implements OnInit {
  hideDate:boolean = false;
  visibleDivIndices: number[] = [];
  StopPayment:any;
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1
  };
  sliderOne: any;
  autoReplenishments: any;
  paymentMethod: any;
  addAutoReplenishmentRequest: AddAutoReplenishment;
  denominations: Denominations[] = [];
  addAmount: Amount[] = [];
  createObject: any;
  stopPaymentDate: any;
  todaydate: String = new Date().toISOString();
  maxdate: String = new Date().toISOString();
  maxYear: Date;
  defaultDate: Date;
  popHeading;
  fundDate;
  popdescription;
  allPatronSourceAccounts: any;
  mergedPatronSourceAccounts: any;
  isDefaultPayment: any;
  isIndividualPatron: any;
  public subscribers: any = {};
  isNoRecordsFound: boolean = false;
  isFromChanged: boolean = false;
  errormessage = "";
  shadowSystem: boolean;
  defaultSelectedPaymentMethod: any;
  @ViewChild('slideWithNav') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  constructor(private router: Router,
    public languageService: LanguageService, public datepipe: DatePipe,
    private sharedService: SharedService, public modalController: ModalController,
    private translateService: TranslateService, private alertController: AlertController,
    private dataService: DataService, private alertService: AlertService,private translate: TranslateService) {
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    }
  }

  ngOnInit() {
    this.defaultDate = new Date();
    this.defaultDate.setDate(this.defaultDate.getDate() + 1);
    this.todaydate = new Date(this.defaultDate).toISOString();
    this.maxYear = new Date();
    this.maxYear = new Date((new Date().getFullYear() + 10),new Date().getMonth(), new Date().getDate());
    this.maxdate = new Date(this.maxYear).toISOString();
    this.isIndividualPatron = this.sharedService.getDashboardAR();
    this.subscribers.getSelectedAR = this.sharedService.getSelectedAR().subscribe((data) => {
      this.isIndividualPatron = data;
      this.getIsDataAvailable();
    });
    this.onFundReinitialize();
    this.toggleVisibility(0)
    setTimeout(() => {
      this.swiperReady();
    }, 6000);
    setTimeout(() => {
      this.toggleVisibility(0)
    }, 4000);
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
    console.log("this.swiper", this.swiper);
  }

  onFundReinitialize() {
    this.defaultDate = new Date();
    this.defaultDate.setDate(this.defaultDate.getDate() + 1);
    this.todaydate = new Date(this.defaultDate).toISOString();
    this.getIsDataAvailable();

    this.denominations = [
      { 'value': 5, 'option': '$5.00' },
      { 'value': 10, 'option': '$10.00' },
      { 'value': 20, 'option': '$20.00' },
      { 'value': 30, 'option': '$30.00' },
      { 'value': 40, 'option': '$40.00' },
      { 'value': 50, 'option': '$50.00' },
      { 'value': 60, 'option': '$60.00' },
      { 'value': 70, 'option': '$70.00' },
      { 'value': 80, 'option': '$80.00' },
      { 'value': 90, 'option': '$90.00' },
      { 'value': 100, 'option': '$100.00' }
    ];

    this.addAmount = [
      { 'value': 10, 'option': '$10.00' },
      { 'value': 20, 'option': '$20.00' },
      { 'value': 30, 'option': '$30.00' },
      { 'value': 40, 'option': '$40.00' },
      { 'value': 50, 'option': '$50.00' },
      { 'value': 60, 'option': '$60.00' },
      { 'value': 70, 'option': '$70.00' },
      { 'value': 80, 'option': '$80.00' },
      { 'value': 90, 'option': '$90.00' },
      { 'value': 100, 'option': '$100.00' }
    ];
  }

  getIsDataAvailable() {
    this.sharedService.loading.next(true);
    this.getPaymentMethods();

    setTimeout(() => {
      this.getAllPatronSourceAccounts();
    }, 3000);
  }

  getAllPatronSourceAccounts() {
    this.sharedService.loading.next(true);
    this.dataService.getAllPatronSourceAccounts()
      .subscribe(
        (response: any) => {
          // this.spinnerService.hide();
          if (response.body.APIStatus == 'Success') {
            // this.allPatronSourceAccounts = response.Patrons;
            this.allPatronSourceAccounts = response.body.Patrons.filter(item => {
              return (item.Active === true);
            });
            this.getfilterIndividualPatron(this.allPatronSourceAccounts);
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  getfilterIndividualPatron(allPatronSourceAccounts) {
    if (this.isIndividualPatron && this.isIndividualPatron.PatronDetails) {
      this.allPatronSourceAccounts = allPatronSourceAccounts.filter(item => {
        return (item.IntPatronId === this.isIndividualPatron.PatronDetails && item.Active === true);
      });
    }
    // this.allPatronSourceAccounts = allPatronSourceAccounts.filter(item => {
    //   return (item.Active === true);
    // });
    if (this.allPatronSourceAccounts.length > 0) {
      this.isNoRecordsFound = false;
    } else {
      this.isNoRecordsFound = true;
    }
    this.getAllSourceAccounts(this.allPatronSourceAccounts);
    this.getAutoReplenishment();
  }

  getAutoReplenishment() {
    this.sharedService.loading.next(true);
    this.dataService.getAutoReplenishments()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.autoReplenishments = response.body.SourceAccounts;
            if (this.autoReplenishments.length > 0) {
              this.getMergedArray(this.mergedPatronSourceAccounts, this.autoReplenishments);
            }
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  getPaymentMethods() {
    this.sharedService.loading.next(true);
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          //this.spinnerService.hide();
          if (response.body.APIStatus === 'Success') {
            let defaultPayment = [];
            let nonDefaultPayment = [];
            this.paymentMethod = response.body.PaymentMethods.filter(item => {
              return (item.Valid === true);
            });
            this.paymentMethod.forEach((paymentData) => {
              if (paymentData.Default === true) {
                this.isDefaultPayment = true;
                defaultPayment.push(paymentData);
              } else {
                nonDefaultPayment.push(paymentData);
              }
            });
            this.paymentMethod = [];
            this.paymentMethod = defaultPayment.concat(nonDefaultPayment);
            this.defaultSelectedPaymentMethod = this.paymentMethod[0];
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);

        }
      );
  }

  getAllSourceAccounts(allPatronSourceAccounts) {
    const array = [];
    allPatronSourceAccounts.forEach((patronData) => {
      patronData.SourceAccounts.forEach((sourceAccount) => {
        const obj = {
          IntPatronId: '',
          IntSiteId: '',
          SiteId: '',
          PatronId: '',
          FirstName: '',
          LastName: '',
          IntUserId: '',
          IntPatronAccountId: '',
          IntFundId: '',
          AccountName: '',
          Balance: '',
          ExpireDate: '',
          Status: '',
          PaymentMethodId: '',
          TriggerValue: null,
          ChargeAmount: null
        }
        obj.IntPatronId = patronData.IntPatronId;
        obj.IntSiteId = patronData.IntSiteId;
        obj.SiteId = patronData.SiteId;
        obj.PatronId = patronData.PatronId;
        obj.FirstName = patronData.FirstName;
        obj.LastName = patronData.LastName;
        obj.IntUserId = patronData.IntUserId;
        obj.IntPatronAccountId = sourceAccount.IntPatronAccountId;
        obj.IntFundId = sourceAccount.IntFundId;
        obj.AccountName = sourceAccount.AccountName;
        obj.Balance = sourceAccount.Balance.toFixed(2);
        obj.TriggerValue = sourceAccount.TriggerValue ? sourceAccount.TriggerValue : 5;
        obj.ChargeAmount = sourceAccount.ChargeAmount ? sourceAccount.ChargeAmount : 10;
        obj.Status = '';
        if (this.isDefaultPayment === true) {
          obj.PaymentMethodId = this.paymentMethod[0];
        }
        array.push(obj);
      });
      if (this.paymentMethod) {
        // patronData.PaymentMethodId = this.paymentMethod[0];
      }
    });

    this.mergedPatronSourceAccounts = array;
  }

  getMergedArray(allPatronSourceAccounts, autoReplenishments) {
    allPatronSourceAccounts.forEach((patronData) => {
      autoReplenishments.forEach((data) => {
        if ((patronData.IntPatronId === data.IntPatronId) && (patronData.IntPatronAccountId === data.IntPatronAccountId)) {
          patronData.IntRecurringPaymentId = data.IntRecurringPaymentId;
          const selectedPaymentMethod = this.getPaymentMethodId(data);
          patronData.AccountNumber = selectedPaymentMethod[0].AccountNumber;
          patronData.PaymentMethodId = selectedPaymentMethod[0];
          patronData.IntPatronAccountId = data.IntPatronAccountId;
          patronData.TriggerValue = data.TriggerValue;
          patronData.ChargeAmount = data.ChargeAmount;
          patronData.ExpireDate = data.ExpireDate;
          patronData.PreAuthType = data.PreAuthType;
          patronData.Active = data.Active;
          patronData.Status = data.Status[0];
          patronData.TotalProcessingFee = Number(data.ProcessingFee.TotalProcessingFee).toFixed(2);
          patronData.PaymentType = data.PreAuthType;
          if (patronData.PaymentType == 'CC') {
            patronData.PaymentTypeMsg = 'ICF_1';
            patronData.showPerTransaction = false;
          } else if (patronData.PaymentType == 'ACH') {
            patronData.PaymentTypeMsg = 'FH_Transaction_Amount';
            patronData.showPerTransaction = true;
          }
        } else {
          if (this.paymentMethod) {
            // patronData.PaymentMethodId = this.paymentMethod[0];
          }
        }

      });
    });

    this.mergedPatronSourceAccounts = allPatronSourceAccounts;
  }

  getPaymentMethodId(autoReplenishments) {
    const getPaymentIdObj = this.paymentMethod.filter(item => {
      if ((item.PaymentType === autoReplenishments.PreAuthType) && (item.AccountNumber === autoReplenishments.PreAuthAccount)) {
        return item;
      }
    });
    return getPaymentIdObj;
  }

  onToggleActive(event, patronDetail, index, formData: NgForm) {  
    this.mergedPatronSourceAccounts[index].Active = event;
    if (event === false && patronDetail.IntRecurringPaymentId !== undefined ) {
     //setTimeout(() => {
      const alert = this.alertController.create({
        header: this.translateService.instant('warning'),
        message: this.translateService.instant('Turn_off_AR'),
        buttons: [
          {
            text: this.translateService.instant('No'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              this.mergedPatronSourceAccounts[index].Active = true;
            }
          }, {
            text: this.translateService.instant('yes'),
            handler: () => {
              this.removeAutoReplenishment(patronDetail);
            }
          }
        ]
      });
      alert.then((res) => {
        res.present();
      });
   // }, 3000);
    } else {
      // this.addAutoReplenishments(formData, patronDetail, index);
    }
  }

  removeAutoReplenishment(patronDetail) {
    const removeObject = {
      "IntSiteId": patronDetail.IntSiteId,
      "IntPatronId": patronDetail.IntPatronId,
      "IntRecurringPaymentId": patronDetail.IntRecurringPaymentId
    }
    this.sharedService.loading.next(true);
    this.dataService.removeAutoReplenishment(removeObject)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('AR_Turn_Off_successfully');
            const header = this.translateService.instant('warning');
            this.alertService.alert(header, message);
            this.getAllPatronSourceAccounts();
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(true);
        });
  }

  async addAutoReplenishments(formData: NgForm, data, index) {
    
    const modal = await this.modalController.create({
      component: AutoReplenishmentTermsPage
    });
    modal.onDidDismiss()
      .then((modalData) => {
       if (modalData.data === 1) {
        this.isFromChanged = false;
        if (data.IntRecurringPaymentId) {
          this.isAgreeUpdateAutoReplenishments(formData, data, index);
        } else {
          this.isAgreeAddAutoReplenishments(formData, data);
        }
      } else {
        this.mergedPatronSourceAccounts[index].Active = false;
      }
    });
    return await modal.present();

  }

  isAgreeUpdateAutoReplenishments(formData: NgForm, data, index) {
    let fundUpdate = [];
    let updatefundObj = {
      "IntRecurringPaymentId": data.IntRecurringPaymentId,
      "IntSiteId": data.IntSiteId,
      "IntPatronId": data.IntPatronId,
      "IntPatronAccountId": data.IntPatronAccountId,
      "TriggerValue": formData.value.BalanceLevel,
      "ChargeAmount": formData.value.Amount,
      "ExpireDate": this.stopPaymentDate ? this.stopPaymentDate : this.mergedPatronSourceAccounts[index].ExpireDate,
      "PaymentMethodId": data.PaymentMethodId.PaymentMethodId,
      "Active": true
    };
    fundUpdate.push(updatefundObj);
    let updatefundReqObj = {
      "SourceAccounts": fundUpdate
    };
    this.sharedService.loading.next(true);
    this.dataService.updateAutoReplenishment(updatefundReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('AR_saved_successfully');
            this.alertService.successToast(message);
            this.onFundReinitialize();
          } else {
            if (response.body.PEProcessingMessages) {
              if (response.body.PEProcessingMessages.length === 1) {
                const message = this.translateService.instant('ERROR_CONTACT_SUPPORT') +" - " + response.body.PEProcessingMessages[0]
                this.alertService.failureToast(message);
                
              }
              else {
                this.errormessage = this.translateService.instant('ERROR_CONTACT_SUPPORT');
                for (var i = 0; i < response.body.PEProcessingMessages.length; i++) {
                  this.errormessage += response.body.PEProcessingMessages[i] + ", ";
                  
                }
                const message = this.errormessage.replace(/,\s*$/, "");
                this.alertService.failureToast(message);
                
              }
            } else {
              const message = this.translateService.instant('ERROR_CONTACT_SUPPORT');
              this.alertService.failureToast(message);
            }
            // let snackBarRef = this.snackBar.open(this.translateService.instant(response.APIStatusReason),
            //   this.translateService.instant('close'), {
            //     duration: 8000
            //   });
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  isAgreeAddAutoReplenishments(formData: NgForm, data) {
    let fundAdd = [];
    let addfundObj = {
      "IntSiteId": data.IntSiteId,
      "IntPatronId": data.IntPatronId,
      "IntPatronAccountId": data.IntPatronAccountId,
      "TriggerValue": formData.value.BalanceLevel,
      "ChargeAmount": formData.value.Amount,
      "ExpireDate": this.stopPaymentDate,
      "PaymentMethodId": data.PaymentMethodId.PaymentMethodId,
      "Active": true
    };
    fundAdd.push(addfundObj);
    let addfundReqObj = {
      "SourceAccounts": fundAdd
    };
    this.sharedService.loading.next(true);
    this.dataService.addAutoReplenishment(addfundReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('AR_saved_successfully');
            this.alertService.successToast(message);
            this.onFundReinitialize();
          }
          else {
            if (response.body.PEProcessingMessages) {
              if (response.body.PEProcessingMessages.length === 1) {
                const message = this.translateService.instant('ERROR_CONTACT_SUPPORT') +" - " + response.body.PEProcessingMessages[0]
                this.alertService.failureToast(message);
              }
              else {
                this.errormessage = this.translateService.instant('ERROR_CONTACT_SUPPORT');
                for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                  this.errormessage += response.PEProcessingMessages[i] + ", ";
                }
                const message = this.errormessage.replace(/,\s*$/, "");
                this.alertService.failureToast(message);
              }
            } else {
              const message = this.translateService.instant('ERROR_CONTACT_SUPPORT');
              this.alertService.failureToast(message);
            }

          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  isFormModified() {
    this.isFromChanged = true;
    this.hideDate = false;
  }

  stopPaymentDateChange(stopPayment, i) {
    this.stopPaymentDate = this.datepipe.transform(stopPayment.detail.value, 'MM/dd/yyyy');
    this.toggleVisibility(i)
  }

  viewHistory() {
    this.sharedService.setViewHistoryData('Auto Replenishment');
    this.router.navigate(['/dashboard/payment-history']);
  }

  turnOffAllAR() {

    const alert = this.alertController.create({
      header: this.translateService.instant('warning'),
      message: this.translateService.instant('Turn_off_All_AR_Msg'),
      buttons: [
        {
          text: this.translateService.instant('No'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          }
        }, {
          text: this.translateService.instant('yes'),
          handler: () => {
             this.confirmTurnOffAllAR();
          }
        }
      ]
    });
    alert.then((res) => {
      res.present();
    });
  }

  confirmTurnOffAllAR() {
    let fundUpdate = [];
    this.mergedPatronSourceAccounts.forEach((patronData) => {
      if (patronData.IntRecurringPaymentId && patronData.IntRecurringPaymentId !== undefined) {

        let updatefundObj = {
          "IntRecurringPaymentId": patronData.IntRecurringPaymentId,
          "IntSiteId": patronData.IntSiteId,
          "IntPatronId": patronData.IntPatronId,
          "IntPatronAccountId": patronData.IntPatronAccountId,
          "TriggerValue": patronData.BalanceLevel,
          "ChargeAmount": patronData.Amount,
          "ExpireDate": patronData.ExpireDate,
          "PaymentMethodId": patronData.PaymentMethodId.PaymentMethodId,
          "Active": false
        };
        fundUpdate.push(updatefundObj);
      }
    });
    let updatefundReqObj = {
      "SourceAccounts": fundUpdate
    };
    this.sharedService.loading.next(true);
    this.dataService.updateAutoReplenishment(updatefundReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('All_AR_Turn_Off_successfully');
            this.alertService.successToast(message);
            this.getAllPatronSourceAccounts();
          } else {
            const message = this.translateService.instant(response.body.APIStatusReason);
            this.alertService.failureToast(message);
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }


  //Move to previous slide
  slidePrev(object, slideView) {
    this.swiper?.slidePrev();
      this.checkIfNavDisabled(object, slideView);
  }

  //Move to Next slide
  slideNext(object, slideView) {
    this.swiper?.slideNext();
      this.checkIfNavDisabled(object, slideView);
  }

  SlideDidChange(object, slideView) {
    this.checkIfNavDisabled(object, slideView);
  }

  //Call methods to check if slide is first or last to enable disbale navigation  
  checkIfNavDisabled(object, slideView) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }


  checkisBeginning(object, slideView) {
    slideView.isBeginning;
  }
  checkisEnd(object, slideView) {
    slideView.isEnd
  }

  statusAuto(statusmessage){
    let message: string;
    let header: string;
    header = 'Status';
    message = this.translate.instant(statusmessage)
    this.alertService.infoAlertNotification(message, header);
  }

  selectDate(){
    this.hideDate = !this.hideDate;
  }

  openCalendar(){
    this.hideDate = !this.hideDate;
  }
  selecDates(event){
    console.log(event.target.value);
  }

  isVisible(index: number): boolean {
    return this.visibleDivIndices.includes(index);
  }

  // Function to toggle visibility based on index
  toggleVisibility(index: number): void {
    const isVisible = this.visibleDivIndices.includes(index);

    if (isVisible) {
      // If div is already visible, hide it
      this.visibleDivIndices = this.visibleDivIndices.filter(i => i !== index);
    } else {
      // If div is not visible, show it
      this.visibleDivIndices.push(index);
    }
    if(this.stopPaymentDate){
      const date = new Date(this.stopPaymentDate);
      date.setDate(date.getDate() + 1);
      this.fundDate = date.toISOString();
    }else{
      this.fundDate = this.maxdate;
    }
  }

}

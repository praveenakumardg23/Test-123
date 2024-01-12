import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { SharedService } from 'src/app/services/shared/shared.service';
import { DataService } from 'src/app/services/data/data.service';
import { LanguageService } from 'src/app/services/language/language.service';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { AddAutoReplenishment, Denominations, Amount } from '../model/auto-replenishment';
import { AlertService } from 'src/app/services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { AutoReplenishmentTermsPage } from 'src/app/auto-replenishment-terms/auto-replenishment-terms.page';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';


register();
@Component({
  selector: 'app-auto-replenishment-meal',
  templateUrl: './auto-replenishment-meal.component.html',
  styleUrls: ['./auto-replenishment-meal.component.scss'],
})
export class AutoReplenishmentMealComponent implements OnInit, OnDestroy {
  visibleDivIndices: number[] = [];
  hideDate:boolean = false;
  hideSelect:boolean = false;
  canEdit:boolean = false;
  date_event:any;
  StopPayment:any;
  sliderOne: any;
  dateExample = new Date().toISOString();
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1
  };
  autoReplenishments: any;
  userPatronDetail: any;
  mergedUserPatronDetail: any;
  paymentMethod: any;
  addAutoReplenishmentRequest: AddAutoReplenishment;
  denominations: Denominations[] = [];
  addAmount: Amount[] = [];
  stopPaymentDate: any;
  todaydate: String = new Date().toISOString();
  maxdate: String = new Date().toISOString();
  maxYear: Date;
  defaultDate: Date ;
  popHeading;
  popdescription;
  statusOnOff;
  mealDate;
  isDefaultPayment: any;
  isIndividualPatron: any;
  filterIndividualPatron: any;
  public subscribers: any = {};
  isNoRecordsFound: boolean = false;
  errormessage = "";
  shadowSystem: boolean;
  isFromChanged: boolean = false;
  // @ViewChild(NgForm) form: NgForm;
  @ViewChild('f', { static: false }) f: NgForm;
  @ViewChild('slideWithNav') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  constructor(private router: Router,
              public languageService: LanguageService, public datepipe: DatePipe,
              private sharedService: SharedService, public modalController: ModalController,
              private translateService: TranslateService, private alertController: AlertController,
              private dataService: DataService, private alertService: AlertService,   private translate: TranslateService) { 
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    }
  }

  ngOnInit() {
    this.defaultDate = new Date();
    this.defaultDate.setDate(this.defaultDate.getDate() + 1);
    this.maxYear = new Date();
    this.maxYear = new Date((new Date().getFullYear() + 10),new Date().getMonth(), new Date().getDate());
    this.maxdate = new Date(this.maxYear).toISOString();
    this.todaydate = new Date(this.defaultDate).toISOString();
    console.log("this.todaydate", this.todaydate)
    this.isIndividualPatron = this.sharedService.getDashboardAR();
    this.subscribers.getSelectedAR = this.sharedService.getSelectedAR().subscribe((data) => {
      this.isIndividualPatron = data;
      this.getIsDataAvailable();
    });

    this.toggleVisibility(0)

    this.onMealReinitialize();
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

  onMealReinitialize(){
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

    this.getPaymentMethods();

    setTimeout(() => {
      this.getUserPatronBalances();
  }, 3000);
  }

  getPaymentMethods() {
    this.sharedService.loading.next(true);
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          //this.spinnerService.hide();
          this.sharedService.loading.next(false);
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
          }
        },
        (error) => {
          console.log(error);
          
        }
      );
  }

  getUserPatronBalances() {
    this.sharedService.loading.next(true);
    this.dataService.getUserPatronBalances()
      .subscribe(
        (response: any) => {
          //this.spinnerService.hide();
          if (response.body.APIStatus == 'Success') {
            this.userPatronDetail = response.body.UserPatronDetail;
            this.mergedUserPatronDetail = response.body.UserPatronDetail.filter(item => {
              return (item.Active === true);
            });
            console.log("this.mergedUserPatronDetail", this.mergedUserPatronDetail)
            this.getfilterIndividualPatron(this.mergedUserPatronDetail);
            // this.sharedService.setUserPatronBalances(this.userPatronDetail);
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  getfilterIndividualPatron(mergedUserPatronDetail) {
    if (this.isIndividualPatron && this.isIndividualPatron.PatronDetails) {
      this.mergedUserPatronDetail = mergedUserPatronDetail.filter(item => {
        return (item.IntPatronId === this.isIndividualPatron.PatronDetails && item.Active === true);
      });
    }
    // this.mergedUserPatronDetail = mergedUserPatronDetail.filter(item => {
    //   return (item.Active === true);
    // });
    if (this.mergedUserPatronDetail.length > 0) {
      this.isNoRecordsFound = false;
    } else {
      this.isNoRecordsFound = true;
    }
    this.getMergedUserPatrons(this.mergedUserPatronDetail);
    this.getAutoReplenishment();
  }

  getMergedUserPatrons(mergedUserPatronDetail) {
    const array = [];
    mergedUserPatronDetail.forEach((patronData) => {
      patronData.PatronAccountBalances.forEach((patronAccountBalance) => {
        if (patronAccountBalance.AccountType === 'Patron' || patronAccountBalance.AccountType === 'PatronSchool') {
          const obj = {
            IntSiteId: '',
            IntUserId: '',
            IntPatronId: '',
            IntDistrictId: '',
            DistrictName: '',
            IntSchoolId: '',
            SchoolName: '',
            PatronId: '',
            FirstName: '',
            MiddleName: '',
            LastName: '',
            ExpireDate: '',
            IntAccountId: '',
            AccountType: '',
            AccountBalance: '',
            Status: '',
            PaymentMethodId: '',
            TriggerValue: null,
            ChargeAmount: null
          }

          obj.IntSiteId = patronData.IntSiteId;
          obj.IntUserId = patronData.IntUserId;
          obj.IntPatronId = patronData.IntPatronId;
          obj.IntDistrictId = patronData.IntDistrictId;
          obj.DistrictName = patronData.DistrictName;
          obj.IntSchoolId = patronData.IntSchoolId;
          obj.SchoolName = patronData.SchoolName;
          obj.PatronId = patronData.PatronId;
          obj.FirstName = patronData.FirstName;
          obj.MiddleName = patronData.MiddleName;
          obj.LastName = patronData.LastName;
          obj.IntAccountId = patronAccountBalance.IntAccountId;
          obj.AccountType = patronAccountBalance.AccountType;
          obj.AccountBalance = patronAccountBalance.AccountBalance.toFixed(2);
          obj.TriggerValue = patronAccountBalance.TriggerValue ? patronAccountBalance.TriggerValue : 5;
          obj.ChargeAmount = patronAccountBalance.ChargeAmount ? patronAccountBalance.ChargeAmount : 10;
          obj.Status = '';
          if(this.isDefaultPayment === true){
            obj.PaymentMethodId = this.paymentMethod[0];
          }

          array.push(obj);
        }
      });
    });
    this.mergedUserPatronDetail = array;
  }

  getAutoReplenishment() {
    this.sharedService.loading.next(true);
    this.dataService.getAutoReplenishments()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.autoReplenishments = response.body.MealAccounts;
            if (this.autoReplenishments.length > 0) {
              this.getMergedArray(this.mergedUserPatronDetail, this.autoReplenishments);
            }
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        }
      );
  }

  getMergedArray(userPatronDetail, autoReplenishments) {
    let matches = [];
    userPatronDetail.forEach((patronData) => {
      autoReplenishments.forEach((data) => {
        if ((patronData.IntPatronId === data.IntPatronId)) {
          patronData.IntRecurringPaymentId = data.IntRecurringPaymentId;
          const selectedPaymentMethod = this.getPaymentMethodId(data);
          patronData.AccountNumber = selectedPaymentMethod[0].AccountNumber;
          patronData.PaymentMethodId = selectedPaymentMethod[0];
          patronData.IntPatronAccountId = data.IntPatronAccountId;
          patronData.TriggerValue = data.TriggerValue;
          patronData.ChargeAmount = data.ChargeAmount;
          patronData.ExpireDate = data.ExpireDate;
          patronData.PreAuthType = data.PreAuthType;
          patronData.IntAccountId = data.IntAccountId;
          patronData.Active = data.Active;
          patronData.Status = data.Status[0];
          patronData.TotalProcessingFee = Number(data.ProcessingFee.TotalProcessingFee).toFixed(2);
          patronData.PaymentType = data.PreAuthType;
          if(patronData.PaymentType == 'CC') {
            patronData.PaymentTypeMsg = 'ICF_1';
            patronData.showPerTransaction = false;
          } else if (patronData.PaymentType == 'ACH') {
            patronData.PaymentTypeMsg = 'FH_Transaction_Amount';
            patronData.showPerTransaction = true;
          }
        }else if(patronData.IntPatronId !== data.IntPatronId && this.paymentMethod){
            // patronData.PaymentMethodId = this.paymentMethod[0];
        }
      })
    })
    this.mergedUserPatronDetail = userPatronDetail;
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
    this.mergedUserPatronDetail[index].Active = event;
    if (event === false && patronDetail.IntRecurringPaymentId !== undefined) {
    //  setTimeout(() => {
      const alert = this.alertController.create({
        header: this.translateService.instant('warning'),
        message: this.translateService.instant('Turn_off_AR'),
        buttons: [
          {
            text: this.translateService.instant('No'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              this.mergedUserPatronDetail[index].Active = true;
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
    // }, 1000);
    } else {
      // this.addAutoReplenishments(formData, patronDetail, index);
    }
  }

  removeAutoReplenishment(patronDetail){
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
            this.getUserPatronBalances();
          }
        },
        (error) => {
          console.log(error);
          this.sharedService.loading.next(false);
        });
  }

  isFormModified() {
    this.isFromChanged = true;
    // this.hideDate = false;
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
        this.mergedUserPatronDetail[index].Active = false;
      }
    });
    return await modal.present();
    
    // this.popHeading = this.translateService.instant('Terms_and_Conditions');
    // const modalRef = this.modalService.open(AddAutoreplenishmentTermsDialogComponent, { centered: true });
    // modalRef.componentInstance.popupHeading = this.popHeading;
    // modalRef.componentInstance.isAgreeConfirm.subscribe((receivedEntry) => {
    //   if (receivedEntry === 1) {
    //     this.isFromChanged = false;
    //     if (data.IntRecurringPaymentId) {
    //       this.isAgreeUpdateAutoReplenishments(formData, data, index);
    //     } else {
    //       this.isAgreeAddAutoReplenishments(formData, data);
    //     }
    //   } else {
    //     this.mergedUserPatronDetail[index].Active = false;
    //   }
    // });
  }

  isAgreeAddAutoReplenishments(formData: NgForm, data) {
    let mealsAdd = [];
    let addObj = {
      "IntSiteId": data.IntSiteId,
      "IntPatronId": data.IntPatronId,
      "IntAccountId": data.IntAccountId,
      "TriggerValue": formData.value.BalanceLevel,
      "ChargeAmount": formData.value.Amount,
      "ExpireDate": this.stopPaymentDate,
      "PaymentMethodId": data.PaymentMethodId.PaymentMethodId,
      "Active": true
    };
    mealsAdd.push(addObj);
    let addReqObj = {
      "Meals": mealsAdd
    };
    this.sharedService.loading.next(true);
    this.dataService.addAutoReplenishment(addReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('AR_saved_successfully');
            this.alertService.successToast(message);
            this.onMealReinitialize();
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

  isAgreeUpdateAutoReplenishments(formData: NgForm, data, index) {
    let mealsUpdate = [];
    let updateObj = {
      "IntRecurringPaymentId": data.IntRecurringPaymentId,
      "IntSiteId": data.IntSiteId,
      "IntPatronId": data.IntPatronId,
      "IntAccountId": data.IntAccountId,
      "TriggerValue": formData.value.BalanceLevel,
      "ChargeAmount": formData.value.Amount,
      "ExpireDate": this.stopPaymentDate ? this.stopPaymentDate : this.mergedUserPatronDetail[index].ExpireDate,
      "PaymentMethodId": data.PaymentMethodId.PaymentMethodId,
      "Active": true
    };
    mealsUpdate.push(updateObj);
    let updateReqObj = {
      "Meals": mealsUpdate
    };
    this.sharedService.loading.next(true);
    this.dataService.updateAutoReplenishment(updateReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('AR_saved_successfully');
            this.alertService.successToast(message);
            this.onMealReinitialize();
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

  stopPaymentDateChange(stopPayment, i) {
    this.stopPaymentDate = this.datepipe.transform(stopPayment.detail.value, 'MM/dd/yyyy');
    this.hideDate = false;
    console.log(this.stopPaymentDate);
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
    let mealsUpdate = [];
    this.mergedUserPatronDetail.forEach((patronData) => {
      if (patronData.IntRecurringPaymentId && patronData.IntRecurringPaymentId !== undefined) {
        let updateObj = {
          "IntRecurringPaymentId": patronData.IntRecurringPaymentId,
          "IntSiteId": patronData.IntSiteId,
          "IntPatronId": patronData.IntPatronId,
          "IntAccountId": patronData.IntAccountId,
          "TriggerValue": patronData.BalanceLevel,
          "ChargeAmount": patronData.Amount,
          "ExpireDate": patronData.ExpireDate,
          "PaymentMethodId": patronData.PaymentMethodId.PaymentMethodId,
          "Active": false
        };
        mealsUpdate.push(updateObj);
      }
    });

    let updateReqObj = {
      "Meals": mealsUpdate
    };
    this.sharedService.loading.next(true);
    this.dataService.updateAutoReplenishment(updateReqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus === 'Success') {
            const message = this.translateService.instant('All_AR_Turn_Off_successfully');
            this.alertService.successToast(message);
            this.getUserPatronBalances();
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
    slideView.isEnd;
  }

  statusAuto(statusmessage){
    let message: string;
    let header: string;
    header = 'Status';
    message = this.translate.instant(statusmessage)
    this.alertService.infoAlertNotification(message,header);
  }

  ngOnDestroy() {
    this.onUnsubscribes();
  }

  onUnsubscribes(){
    if(this.f) {
      this.f.reset();
    }
    this.subscribers.getSelectedAR.unsubscribe();
  }

  ionViewDidLeave(){
    this.f.reset({});
    this.f.resetForm();
    this.subscribers.getSelectedAR.unsubscribe();
  }

  ionViewWillLeave(){ 
    this.f.reset({});
    this.f.resetForm();
    this.subscribers.getSelectedAR.unsubscribe();
  }
  // openCalendar(i){
  //   this.hideDate = i;
  // }
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
      this.mealDate = date.toISOString();
    }else{
      this.mealDate = this.maxdate;
    }
  }
  selecDates(event){
    console.log(event.target.value);
  }
  datePick(){
    this.date_event = this.date_event.substring(0, 10);
  }
}
 
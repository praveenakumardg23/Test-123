import { Router } from '@angular/router';
import { LanguageService } from './../services/language/language.service';
import { Component, OnInit, ViewChild ,Input, ElementRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { SharedService } from '../services/shared/shared.service';
import { DataService } from '../services/data/data.service';
import { FeesComponent } from '../patron-detail/fees/fees.component';
import { DatePipe } from '@angular/common';
import { AlertService } from '../services/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { ScheduledPaymentsInstallmentsDetails, ScheduledPayments } from '../services/data/model/schedulefee';
import { CustomFieldsComponent } from '../custom-fields/custom-fields.component';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import { EventService } from '../serviceEvent/event.service';

register();
@Component({
  selector: 'app-schedule-fees',
  templateUrl: './schedule-fees.page.html',
  styleUrls: ['./schedule-fees.page.scss'],
})
export class ScheduleFeesPage implements OnInit {
  visibleDivIndices: number[] = [];
 @ViewChild('slideWithNav') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  // @ViewChild('slideWithNav', { static: true }) slideWithNav: IonSlides;
  @ViewChild('datePicker', { static: true }) datePicker;
  minDate: String = new Date().toISOString();
  maxDate: any = new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();
  sliderOne: any;
  todaydate: Date;
  enddate: Date;
  myDate: any;
  feeData: any;
  ScheduledPaymentMethodData: any;
  FeesForScheduledPayments: any;
  FilteredFeesForScheduledPayments = []
  FilteredScheduledPaymentMethod = [];
  scheduleditemcount = 0;
  InstallmentsLeftToSchedule = 0;
  Installments = 0;
  IntFeePatronId: 0;
  AllowPartial: boolean = false;
  LastScheduelDate = new Date();
  scheduleddatelist = [];
  ActualAmount;
  ScheduleAmount;
  AmountLeftToSehedule;
  ScheduleDate;
  scheduleDate;
  defaultValue = [];
  nonDefaultValue = [];
  ViewPayments: any;
  selectedPaymentMethodId: any;
  PaymentType: any;
  PreAuthAccount: any;
  defaultPreAuthAccount: any;
  defaultPaymentMethodId: any;
  PaymentMethodId: any;
  paymentcheckoutresponse: any
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1
  };
  totalamount = 0;
  AmountDue;
  array = [];
  errormessage;
  districtFeaturelist: any;
  ScheduledPayments: ScheduledPayments;
  ScheduledPaymentslist = []
  remainingAmounttoSehedule = 0;
  remainingInstalmenttoSehedule = 0;
  finalpayload = '';
  TotalProcessingFee: any; CustomFields: any = [];
  showCustomLink:any=false;
  showerror: boolean;
  scheduledFees = [];
  selectedAttribute;
  disableAttribute = false;
  isAttributeSelected: boolean;
  selectedFee:any;
  paymentMethods :any;
  selectedPayment:any;
  noOfInstallments:[];
  constructor(
    public languageService: LanguageService,
    private router: Router,
    private modalController: ModalController,
    private sharedService: SharedService,
    private dataService: DataService,
    public alertService: AlertService,
    private translate: TranslateService,
    private alertController: AlertController,
    private events: EventService,

    public datepipe: DatePipe
  ) {
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
    }
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  //Move to Next slide
  slideNext(object, slideView) {
    this.PreAuthAccount = '';
    this.swiper?.slideNext();
    this.checkIfNavDisabled(object, slideView);
    this.PreAuthAccount = this.defaultPreAuthAccount;
    // this.PaymentMethodId = this.defaultPaymentMethodId;
  }

  //Move to previous slide
  slidePrev(object, slideView) {
    this.swiper?.slidePrev();
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

  // async OnRebindScheduleDetails() {


  //   const modal = await this.modalController.create({
  //     component: FeesComponent,
  //     componentProps: {

  //     }
  //   });
  //   return await modal.present();
  // }
  checkisBeginning(object, slideView) {
    slideView.isBeginning;
  }
  checkisEnd(object, slideView) {
    slideView.isEnd;
  }

  ngOnInit() {
    this.toggleVisibility(1)
    setTimeout(() => {
      this.toggleVisibility(1)
    }, 500);

    setTimeout(() => {
      this.swiperReady();
    }, 6000);
  }
  ionViewWillEnter() {
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.todaydate = new Date();
    this.enddate = new Date();
    this.todaydate.setDate(this.todaydate.getDate() + 1);
    this.minDate = new Date(this.todaydate).toISOString();
    this.myDate = "";
    this.getPaymentMethods();
    this.checkCustomeFieldValue();
    // this.getFeesForScheduledPayments();
    const addedInstallments = this.ScheduledPaymentMethodData.filter(element=>element.IntFeePatronId === this.feeData.IntFeePatronId);
    console.log(addedInstallments,'addedInstallments');

    if(this.ScheduledPaymentMethodData !== null ||this.ScheduledPaymentMethodData !== undefined ) {
      if(this.feeData.NextScheduledPayment && (this.feeData.NextScheduledPayment !== null || this.feeData.NextScheduledPayment !== undefined)) {
        const selectedschedulefee =
        this.ScheduledPaymentMethodData.filter(s => s.IntScheduledPaymentId === this.feeData.NextScheduledPayment.IntScheduledPaymentId);
        console.log('selectedschedulefee',selectedschedulefee);
        this.paymentMethods.forEach(element => {
          if(element.PaymentMethodId.split('_')[1] === selectedschedulefee[0].PaymentMethod ) {
              this.selectedPayment = element.PaymentMethodId;
              this.PaymentMethodId = element.PaymentMethodId;
          }
        });
      }
    }
    if (this.feeData.selectedAttributeValue) {
      if (this.feeData.Attribute.Type === 'Dropdown') {
        this.feeData.Attribute.Options.forEach(element => {
          if (element.IntFeeAttributeId === this.feeData.selectedAttributeValue) {
            this.selectedAttribute = element;
            this.isAttributeSelected = true;
            this.disableAttribute = true;
          }
        });
      } else if(this.feeData.Attribute.Type === 'Radio Button'){
        this.getFeesForScheduledPayments();
      }
      if(this.feeData.ScheduledAmount !== 0 ||  (this.feeData['AmountPaid'] !== undefined && this.feeData.AmountPaid !== 0)){
        this.disableAttribute = true;
      }
  }

  }
  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onDismiss(data) {

    if (this.finalpayload != "") {

      this.dataService.addScheduledPaymentMethod(this.finalpayload)
        .subscribe(
          (response: any) => {
            this.array = [];
            response = response.body;
            this.myDate = [];
            if (response.APIStatus === 'Success') {
              this.disableAttribute = true;

              this.alertService.successToast(this.translate.instant('SF_Installments_Add_Success'));

            } 
            if(response.APIStatus === "Error" && response.APIStatusReason === "Attribute_Not_Available") {
              this.alertService.failureToast(this.translate.instant('ATTRIBUTE_NOT_AVAILABLE1'));
            }
            if(response.APIStatus === "Error" && response.APIStatusReason !== "Attribute_Not_Available"
            && response.APIStatusReason !== "Missing_Mandatory_Fields") {
              this.alertService.failureToast(response.APIStatusReason);
            }
            
            else {
              if (response.PEProcessingMessages) {
                if (response.PEProcessingMessages.length === 1) {
                  this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT'));
                }
                else {
                  this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                  for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                    this.errormessage += response.PEProcessingMessages[i] + ", ";
                  }
                  this.alertService.failureToast(this.errormessage.replace(/,\s*$/, ""));
                }
              } else {
                this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
              }
            }
            this.getPaymentMethods();
            this.modalController.dismiss(data);
            //this.onDismiss('refresh');
          },
          (error) => {

            console.log(error);
          }
        )
    }
    else {

      this.modalController.dismiss(data);
    }
  }
  checkCustomeFieldValue()
  {
    if(this.feeData.CustomFields)
    {  
        let customTextData=this.feeData.CustomFields.filter(value=> value.Type === "Text Field"  ||  value.Type === "Text Area");
        let CustomOptionData = this.feeData.CustomFields.filter(value=> value.Type =="Checkbox"|| value.Type == "List" || value.Type =='Dropdown' || value.Type =='Radio Button');
        let CustomFieldsText= customTextData.filter(value=> value.UserValue!=null  &&  value.UserValue!="");
        let CustomFieldsOption= [];
        CustomOptionData.forEach((value)=> {
               value.Options.filter( (x) => {
               if(x.IsSelected === true) {
                CustomFieldsOption.push(x)
               }
              })
          });
          console.log(CustomFieldsText, CustomFieldsOption)
      if((CustomFieldsText && CustomFieldsText.length > 0) || (CustomFieldsOption && CustomFieldsOption.length > 0) && this.feeData.Installments > this.InstallmentsLeftToSchedule)
      {
        this.showCustomLink=true;
      } else {
        this.showCustomLink=false;
      }
    }
  }
  getPaymentMethods() {
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          response = response.body;
          this.defaultValue = [];
          this.nonDefaultValue = [];
          if (response.PaymentMethods.length > 0) {
            for (let i = 0; i < response.PaymentMethods.length; i++) {
              if (response.PaymentMethods[i].Default == true && response.PaymentMethods[i].Valid === true) {
                this.defaultValue.push(response.PaymentMethods[i]);
                this.selectedPaymentMethodId = response.PaymentMethods[i].PaymentMethodId
                this.PaymentType = response.PaymentMethods[i].PaymentType
                this.PreAuthAccount = response.PaymentMethods[i].AccountNumber
                this.defaultPreAuthAccount = response.PaymentMethods[i].AccountNumber
                this.defaultPaymentMethodId = response.PaymentMethods[i].PaymentMethodId
                this.PaymentMethodId = response.PaymentMethods[i].PaymentMethodId
              } else {
                if (response.PaymentMethods[i].Valid === true) {
                  this.nonDefaultValue.push(response.PaymentMethods[i]);
                }

              }
            }


            this.ScheduledPaymentslist = [];
            let scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
            this.ViewPayments = [];


            this.ViewPayments = this.defaultValue.concat(this.nonDefaultValue);
            console.log('feeData',this.feeData)
            if (this.feeData.modifiedFeeType === "Assigned Fee") {
              this.AmountDue = Number(this.feeData.NetAmount - this.feeData.ScheduledAmount - (this.feeData.CartAmount ? this.feeData.CartAmount : 0))
              this.AmountLeftToSehedule = this.ActualAmount = this.ScheduleAmount = Number(this.feeData.NetAmount - this.feeData.ScheduledAmount - (this.feeData.CartAmount ? this.feeData.CartAmount : 0))
              this.remainingAmounttoSehedule = this.ActualAmount
            }
            else if (this.feeData.modifiedFeeType === "Optional Fee") {
              this.AmountDue = Number(this.feeData.AmountDue - (this.feeData.CartAmount ? this.feeData.CartAmount : 0));
              this.AmountLeftToSehedule = this.ActualAmount = this.ScheduleAmount = Number(this.feeData.AmountDue - (this.feeData.CartAmount ? this.feeData.CartAmount : 0))
              this.remainingAmounttoSehedule = this.ActualAmount

            }
            if (this.feeData.EndDate != "")
              this.enddate = this.feeData.EndDate;
            if (this.feeData.EndDate != "")
              this.maxDate = new Date(new Date(this.feeData.EndDate)).toISOString();
            // this.maxDate = new Date(this.feeData.EndDate).toISOString();
            this.FilteredScheduledPaymentMethod = [];

            this.FilteredFeesForScheduledPayments = this.ScheduledPaymentMethodData;
            if (this.FilteredFeesForScheduledPayments.length > 0) {
              this.FilteredFeesForScheduledPayments = this.FilteredFeesForScheduledPayments.filter(s => s.IntPatronId === this.feeData.IntPatronId && s.IntFeePatronId === this.feeData.IntFeePatronId);
              if (this.FilteredFeesForScheduledPayments.length > 0) {
                this.scheduleditemcount = this.FilteredFeesForScheduledPayments.length;
                this.InstallmentsLeftToSchedule = this.FilteredFeesForScheduledPayments[0].InstallmentsLeftToSchedule;
                this.Installments = this.FilteredFeesForScheduledPayments[0].Installments;
                this.IntFeePatronId = this.FilteredFeesForScheduledPayments[0].IntFeePatronId;
                this.AllowPartial = this.FilteredFeesForScheduledPayments[0].AllowPartial;
                for (let i = 0; i < this.FilteredFeesForScheduledPayments.length; i++) {

                  scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
                  scheduledPaymentsInstallmentsDetails.IntSiteId = this.feeData.IntSiteId
                  scheduledPaymentsInstallmentsDetails.IntPatronId = this.feeData.IntPatronId
                  scheduledPaymentsInstallmentsDetails.PaymentAmount = this.FilteredFeesForScheduledPayments[i].PaymentAmount
                  scheduledPaymentsInstallmentsDetails.PaymentDate = this.FilteredFeesForScheduledPayments[i].PaymentDate
                  let filterViewPayments = this.ViewPayments
                  filterViewPayments = filterViewPayments.filter(s => s.AccountNumber === this.FilteredFeesForScheduledPayments[i].PreAuthAccount);
                  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = Number(this.FilteredFeesForScheduledPayments[i].TotalProcessingFee).toFixed(2);
                  scheduledPaymentsInstallmentsDetails.showPerTransaction = this.FilteredFeesForScheduledPayments[i].showPerTransaction

                  scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = this.FilteredFeesForScheduledPayments[i].PaymentTypeMsg;
                  scheduledPaymentsInstallmentsDetails.IntScheduledPaymentId = this.FilteredFeesForScheduledPayments[i].IntScheduledPaymentId
                  scheduledPaymentsInstallmentsDetails.PaymentMethodId =
                  this.ViewPayments.filter( s=> s.PaymentMethodId.split('_')[1] === this.FilteredFeesForScheduledPayments[i].PaymentMethod)[0].PaymentMethodId;
                  // filterViewPayments.forEach(element => {
                  //   if(element.PaymentMethodId.split('_')[1] === this.FilteredFeesForScheduledPayments[i].PaymentMethod ){
                  //       this.selectedPayment = element.PaymentMethodId;
                  //       this.PaymentMethodId = element.PaymentMethodId;
                  //   }
                  // });
                  scheduledPaymentsInstallmentsDetails.IntScheduledPaymentId = this.FilteredFeesForScheduledPayments[i].IntScheduledPaymentId
                  // scheduledPaymentsInstallmentsDetails.IntScheduledPaymentId = this.FilteredFeesForScheduledPayments[i].IntScheduledPaymentId
                  scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule = this.FilteredFeesForScheduledPayments[i].InstallmentsLeftToSchedule
                  scheduledPaymentsInstallmentsDetails.Installments = this.FilteredFeesForScheduledPayments[0].Installments
                  scheduledPaymentsInstallmentsDetails.AllowPartial = this.FilteredFeesForScheduledPayments[0].AllowPartial
                  scheduledPaymentsInstallmentsDetails.PreAuthAccount = this.FilteredFeesForScheduledPayments[i].PreAuthAccount
                  scheduledPaymentsInstallmentsDetails.ProcessedSw = this.FilteredFeesForScheduledPayments[i].ProcessedSw
                  if (this.feeData.modifiedFeeType === "Assigned Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = this.feeData.IntFeePatronId
                    scheduledPaymentsInstallmentsDetails.IntFeeId = null
                  }
                  else if (this.feeData.modifiedFeeType === "Optional Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = null
                    scheduledPaymentsInstallmentsDetails.IntFeeId = this.feeData.IntFeeId
                  }

                  this.totalamount += Number(this.FilteredFeesForScheduledPayments[i].PaymentAmount)
                  let date;
                  this.LastScheduelDate = new Date(this.FilteredFeesForScheduledPayments[i].PaymentDate)
                  date = this.datepipe.transform(this.FilteredFeesForScheduledPayments[i].PaymentDate, 'MM/dd/yyyy')
                  this.array.push(date)
                  this.scheduleddatelist.push(this.LastScheduelDate)
                  this.ScheduledPaymentslist.push(scheduledPaymentsInstallmentsDetails);
                  console.log('4',this.ScheduledPaymentslist);
                }

                this.AmountLeftToSehedule = this.ActualAmount = this.ScheduleAmount = Number((this.feeData.NetAmount - this.feeData.ScheduledAmount - (this.feeData.CartAmount ? this.feeData.CartAmount : 0))).toFixed(2);
                this.LastScheduelDate.setDate(this.LastScheduelDate.getDate() + 1);
                this.myDate = ""



              } else if (this.FeesForScheduledPayments.length > 0) {
                let objFeesForScheduledPayments = this.FeesForScheduledPayments.filter(s => s.IntPatronId === this.feeData.IntPatronId && s.IntFeeId === this.feeData.IntFeeId);
                if (objFeesForScheduledPayments.length > 0) {
                  this.InstallmentsLeftToSchedule = objFeesForScheduledPayments[0].InstallmentsLeftToSchedule;
                  this.Installments = objFeesForScheduledPayments[0].Installments;
                  this.IntFeePatronId = objFeesForScheduledPayments[0].IntFeePatronId;
                  this.AllowPartial = objFeesForScheduledPayments[0].AllowPartial;
                }
              }
            }
            else {
              if (this.FeesForScheduledPayments.length > 0) {
                let objFeesForScheduledPayments = this.FeesForScheduledPayments.filter(s => s.IntPatronId === this.feeData.IntPatronId && s.IntFeeId === this.feeData.IntFeeId);
                if (objFeesForScheduledPayments.length > 0) {
                  this.InstallmentsLeftToSchedule = objFeesForScheduledPayments[0].InstallmentsLeftToSchedule;
                  this.remainingInstalmenttoSehedule = objFeesForScheduledPayments[0].InstallmentsLeftToSchedule;
                  this.Installments = objFeesForScheduledPayments[0].Installments;
                  this.IntFeePatronId = objFeesForScheduledPayments[0].IntFeePatronId;
                  this.AllowPartial = objFeesForScheduledPayments[0].AllowPartial;
                }
              }
              else {
                this.InstallmentsLeftToSchedule = this.feeData.InstallmentsLeft;
                this.remainingInstalmenttoSehedule = this.feeData.InstallmentsLeft;
                this.Installments = this.feeData.Installments;
                this.IntFeePatronId = this.feeData.IntFeePatronId;
                this.AllowPartial = this.feeData.AllowPartial;
              }
            }

          }
        },
        (error) => {
          console.log(error)
        }
      )
  }
  onSelectedchange(PaymentMethodId) {
    let objViewPayments = this.ViewPayments;
    this.paymentcheckoutresponse = objViewPayments.filter(s => s.PaymentMethodId === PaymentMethodId);
    this.PaymentType = this.paymentcheckoutresponse[0].PaymentType;
    this.PaymentMethodId = this.paymentcheckoutresponse[0].PaymentMethodId;
    this.selectedPayment = this.paymentcheckoutresponse[0].PaymentMethodId;

  }
  isInArray(array, value) {

    return (array.find(item => { return item == value }) || []).length > 0;
  }

  // GetProcessingFee(ProcessingFeepayloadarray) {
  //   this.TotalProcessingFee = "";
  //   this.dataService.GetProcessingFee(ProcessingFeepayloadarray)
  //     .subscribe(
  //       (response: any) => {
  //         debugger;
  //         response = response.body;
  //         if (response.APIStatus === 'Success') {
  //           this.TotalProcessingFee = response.Items[0].ProcessingFee.TotalProcessingFee;
  //           //  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = this.feeData.ProcessedSw

  //         } else {

  //         }
  //         // this.onDismiss();

  //       },
  //       (error) => {

  //         console.log(error);
  //       }
  //     )
  // }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CustomFieldsComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  selectRadioAttribute(event, feeData) {
    let selectedAttr =[]
    console.log(event.target.value);
    feeData.Attribute.Options.map((item:any) =>{
      if(item.IntFeeAttributeId === event.target.value){
        selectedAttr.push(item);
      }
    })
    if (selectedAttr) {
      this.feeData.selectedAttributeValue = selectedAttr[0].IntFeeAttributeId;
      this.feeData.AmountDue = selectedAttr[0].Amount;
      this.AmountLeftToSehedule = selectedAttr[0].Amount;
      feeData.AmountDue = selectedAttr[0].Amount;
      this.ActualAmount =  selectedAttr[0].Amount;
      this.ScheduleAmount = selectedAttr[0].Amount;
      this.remainingAmounttoSehedule = selectedAttr[0].Amount;
      feeData.attributeSelected = true;
      // this.feeData.attributeSelected = true;
      this.selectedAttribute = selectedAttr;
      this.feeData.selectedAttributeValue = selectedAttr[0].IntFeeAttributeId;
      feeData.selectedAttributeValue = selectedAttr[0].IntFeeAttributeId;
      this.isAttributeSelected = true;
      console.log('option' , selectedAttr[0]);
      console.log('selected attribute', this.selectedAttribute);
    }
  }

  selectAttribute(option, feeData) {
    if (option) {
      this.feeData.selectedAttributeValue = option.IntFeeAttributeId;
      this.feeData.AmountDue = option.Amount;
      this.AmountLeftToSehedule = option.Amount;
      feeData.AmountDue = option.Amount;
      this.ActualAmount =  option.Amount;
      this.ScheduleAmount = option.Amount;
      this.remainingAmounttoSehedule = option.Amount;
      feeData.attributeSelected = true;
      this.feeData.attributeSelected = true;
      this.selectedAttribute = option;
      this.feeData.selectedAttributeValue = option.IntFeeAttributeId;
      feeData.selectedAttributeValue = option.IntFeeAttributeId;
      this.isAttributeSelected = true;
      console.log('option' , option);
      console.log('selected attribute', this.selectedAttribute);
    }
  }


  getFeesForScheduledPayments() {
    this.dataService.getFeesForScheduledPayments()
      .subscribe(
        (response: any) => {
          response = response.body;
          if (response.Patrons.length > 0) {
            const selectedPatronFees =  response.Patrons.filter(p=> p.IntPatronId ===this.feeData.IntPatronId );
            this.scheduledFees = selectedPatronFees[0].Fees;
            const index = this.scheduledFees.findIndex((i) => i.IntFeeId === this.feeData.IntFeeId);
            if (index > -1) {
              const selectedFee = this.scheduledFees[index];
              if(selectedFee) {
                if(selectedFee.Attribute && selectedFee.Attribute.Options.length >0) {
                  const selectedAttribute = selectedFee.Attribute.Options.filter((option)=> option.IsSelected === true);
                  if(selectedAttribute.length > 0) {
                    this.feeData.selectedAttributeValue = selectedAttribute[0].IntFeeAttributeId;
                    this.isAttributeSelected = true;
                    if(this.feeData.AmountPaid > 0) this.disableAttribute = true;
                    console.log('selected attribute', this.selectedAttribute);
    
                  }
                }
              }
             }

          }
          // const selectedFee = this.scheduledFees.filter((fee)=> fee.IntFeeId === this.feeData.IntFeeId);
         
        })
      }

  onAddSchedule(response?)
  {
    if(this.feeData.CustomFields && this.feeData.Installments== this.InstallmentsLeftToSchedule)
    {
    this.showCustomFieldsModal('onAddSchedule');
    }
    else
    {
    this.onAddScheduleFuction();
    }
  }
  validateAmount(inputValue){
    let sum = 0;
    inputValue.forEach(element => {
       sum = sum + Number(element.PaymentAmount)
    });
    if(sum>this.feeData.NetAmount){
      this.showerror = true;
    }else{
      this.showerror = false;
    }
  }

  onAddScheduleFuction(CustomFieldPopupData?) {

    let scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
    let totalamountschduled = 0;
    let totalinstalmentschduled = 0;
    this.finalpayload = ""
    if (this.feeData.AllowPartial === false && this.feeData.Installments >= 0) {

      let isdateexist = this.isInArray(this.array, this.datepipe.transform(this.myDate, 'MM/dd/yyyy'))

      if (!isdateexist) {

        if (Number(this.ScheduleAmount) <= Number(this.remainingAmounttoSehedule)) {
          scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
          scheduledPaymentsInstallmentsDetails.IntSiteId = this.feeData.IntSiteId
          scheduledPaymentsInstallmentsDetails.IntPatronId = this.feeData.IntPatronId
          scheduledPaymentsInstallmentsDetails.PaymentAmount = Number(this.ScheduleAmount)
          scheduledPaymentsInstallmentsDetails.PaymentDate = this.myDate,
            scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule = this.remainingInstalmenttoSehedule + 1
          scheduledPaymentsInstallmentsDetails.Installments = this.feeData.Installments
          scheduledPaymentsInstallmentsDetails.AllowPartial = this.feeData.AllowPartial
          scheduledPaymentsInstallmentsDetails.PaymentMethodId = this.PaymentMethodId
          scheduledPaymentsInstallmentsDetails.ProcessedSw = this.feeData.ProcessedSw
          let ProcessingFeepayloadarray = [];
          let PFpayload = {
            "IntSiteId": this.feeData.IntSiteId,
            "IntPatronId": this.feeData.IntPatronId,
            "ChargeAmount": Number(this.ScheduleAmount),
            "PaymentType": this.PaymentType,
            "IntItemId": this.feeData.IntFeeId,
            "ItemType": "Fee"
          };
          ProcessingFeepayloadarray.push(PFpayload);

          let PF = {
            "Items": ProcessingFeepayloadarray
          }
          let FinlPF = JSON.stringify(PF)

          this.dataService.GetProcessingFee(FinlPF)
            .subscribe(
              (response: any) => {

                response = response.body;
                if (response.APIStatus === 'Success') {
                  this.disableAttribute = true;

                  // this.TotalProcessingFee = response.Items[0].ProcessingFee.TotalProcessingFee;
                  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                  if (response.Items[0].PaymentType == "CC") {
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'ICF_1';
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = false;
                  }
                  else if (response.Items[0].PaymentType == "ACH") {
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = true;
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'Schedule_Transaction_Fee';
                  }

                  let date = this.datepipe.transform(this.myDate, 'MM/dd/yyyy')
                  this.array.push(date)
                  let filterViewPayments = this.ViewPayments
                  filterViewPayments = filterViewPayments.filter(s => s.PaymentMethodId === this.PaymentMethodId);

                  scheduledPaymentsInstallmentsDetails.PreAuthAccount = filterViewPayments[0].AccountNumber;

                  ///  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = this.TotalProcessingFee;

                  this.myDate = '';

                  if (this.feeData.modifiedFeeType === "Assigned Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = this.feeData.IntFeePatronId
                    scheduledPaymentsInstallmentsDetails.IntFeeId = null
                  }
                  else if (this.feeData.modifiedFeeType === "Optional Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = null
                    scheduledPaymentsInstallmentsDetails.IntFeeId = this.feeData.IntFeeId
                  }

                  this.ScheduledPaymentslist.push(scheduledPaymentsInstallmentsDetails);
                  console.log('5',this.ScheduledPaymentslist);
                  
                  setTimeout(() => {
                    this.PreAuthAccount = '';
                    this.swiper?.slideNext();
                    this.PreAuthAccount = this.defaultPreAuthAccount;
                    // this.PaymentMethodId = this.defaultPaymentMethodId;
                  }, 1000);



                  // this.slideNext(this.sliderOne,this.slideWithNav)
                  // this.slideNext(this.sliderOne,this.slideWithNav)
                  for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                    totalamountschduled = Number(totalamountschduled) + Number(this.ScheduledPaymentslist[i].PaymentAmount);
                    totalinstalmentschduled = totalinstalmentschduled + 1;

                  }

                  this.AmountLeftToSehedule = this.ScheduleAmount = Number(this.ActualAmount) - Number(totalamountschduled);
                  this.remainingAmounttoSehedule = Number(this.ActualAmount) - Number(totalamountschduled);
                  this.remainingInstalmenttoSehedule = Number(this.feeData.Installments) - Number(totalinstalmentschduled);
                  this.InstallmentsLeftToSchedule = Number(this.feeData.Installments) - Number(totalinstalmentschduled);

                  if(this.feeData.CustomFields && this.feeData.CustomFields.length > 0
                    && this.feeData.Installments > this.InstallmentsLeftToSchedule)
                  {
                    this.showCustomLink=true;
                  }
                  if (Number(totalamountschduled) === Number(this.ActualAmount)) {
                    let payloadarray = [];
                    if (this.IntFeePatronId === 0 || this.IntFeePatronId === null || this.IntFeePatronId === '') {
                      for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {

                        let payload
                       if(this.feeData.selectedAttributeValue)
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": this.feeData.IntFeePatronId? this.feeData.IntFeePatronId:null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                          "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                       else
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                         // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                        payloadarray.push(payload);

                      }
                    }
                    else {
                      for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {

                        let payload
                       if(this.feeData.selectedAttributeValue)
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": this.feeData.IntFeePatronId? this.feeData.IntFeePatronId:null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                          "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                       else
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId":this.ScheduledPaymentslist[i].PaymentMethodId,
                         // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                        payloadarray.push(payload);

                      }

                    }


                    let payload = {
                      "ScheduledPayments": payloadarray
                    }
                    this.finalpayload = JSON.stringify(payload)
                    this.onDismiss('refresh');

                  }
                  else {
                    let request = {
                    
                      "IntSiteId": this.feeData.IntSiteId,
                      "IntPatronId": this.feeData.IntPatronId,
                      "IntFeePatronId": this.feeData.IntFeePatronId ? this.feeData.IntFeePatronId : null,
                      "IntFeeId": this.feeData.IntFeeId,
                      "PaymentNumber": 1,
                      "PaymentAmount": this.feeData.ScheduledAmount? this.feeData.ScheduledAmount: this.feeData.Amount,
                      "PaymentDate": this.feeData.NextScheduledPayment? this.feeData.NextScheduledPayment.PaymentDate: date,
                      "PaymentMethodId": this.PaymentMethodId,
                      "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ? this.feeData.selectedAttributeValue:'',
                      "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
                
                    };
                
                    let payload = {
                      "ScheduledPayments": [request]
                    }
                    this.dataService.addScheduledPaymentMethod(payload)
                      .subscribe(
                        (response: any) => {
                          this.array = [];
                          response = response.body;
                          this.myDate = [];
                          if (response.APIStatus === 'Success') {
                            this.disableAttribute = true;

                            this.alertService.successToast(this.translate.instant('SF_Installments_Add_Success'));

                          } 
                          if(response.APIStatus === "Error" && response.APIStatusReason === "Attribute_Not_Available") {
                            this.alertService.failureToast(this.translate.instant('ATTRIBUTE_NOT_AVAILABLE1'));
                          }
                          if(response.APIStatus === "Error" && response.APIStatusReason !== "Attribute_Not_Available"
                          && response.APIStatusReason !== "Missing_Mandatory_Fields") {
                            this.alertService.failureToast(response.APIStatusReason);
                          }
                          
                          else {
                            if (response.PEProcessingMessages) {
                              if (response.PEProcessingMessages.length === 1) {
                                this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT'));
                              }
                              else {
                                this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                                for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                                  this.errormessage += response.PEProcessingMessages[i] + ", ";
                                }
                                this.alertService.failureToast(this.errormessage.replace(/,\s*$/, ""));
                              }
                            } else {
                              this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                            }
                          }
                          // this.getPaymentMethods();
                          //this.onDismiss('refresh');
                        },
                        (error) => {

                          console.log(error);
                        }
                      )
                  }
                } else {

                }


              },
              (error) => {

                console.log(error);
              }
            )
        } else {

          this.alertService.failureToast(this.translate.instant('SF_Schedule_cannot_be_greater_feeamount'));

        }
      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));

      }

    }
    else {
      this.finalpayload = ""
      let isdateexist = this.isInArray(this.array, this.datepipe.transform(this.myDate, 'MM/dd/yyyy'))

      if (!isdateexist) {
        let data = {};
        if (this.ActualAmount === 0)
          this.ActualAmount = this.ScheduleAmount
        if (Number(this.ScheduleAmount) <= Number(this.remainingAmounttoSehedule)) {
          let date1 = new Date(this.myDate).toLocaleDateString('en-Us');
          scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
          scheduledPaymentsInstallmentsDetails.IntSiteId = this.feeData.IntSiteId
          scheduledPaymentsInstallmentsDetails.IntPatronId = this.feeData.IntPatronId
          scheduledPaymentsInstallmentsDetails.PaymentAmount = Number(this.ScheduleAmount)
          scheduledPaymentsInstallmentsDetails.PaymentDate = date1, //this.myDate
            scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule = this.remainingInstalmenttoSehedule + 1
          scheduledPaymentsInstallmentsDetails.Installments = this.feeData.Installments
          scheduledPaymentsInstallmentsDetails.AllowPartial = this.feeData.AllowPartial
          scheduledPaymentsInstallmentsDetails.PaymentMethodId = this.PaymentMethodId
          scheduledPaymentsInstallmentsDetails.ProcessedSw = this.feeData.ProcessedSw
          let date = this.datepipe.transform(this.myDate, 'MM/dd/yyyy')
          this.array.push(date)
          let filterViewPayments = this.ViewPayments
          filterViewPayments = filterViewPayments.filter(s => s.PaymentMethodId === this.PaymentMethodId);

          scheduledPaymentsInstallmentsDetails.PreAuthAccount = filterViewPayments[0].AccountNumber;
          let ProcessingFeepayloadarray = [];
          let PFpayload = {
            "IntSiteId": this.feeData.IntSiteId,
            "IntPatronId": this.feeData.IntPatronId,
            "ChargeAmount": Number(this.ScheduleAmount),
            "PaymentType": this.PaymentType,
            "IntItemId": this.feeData.IntFeeId,
            "ItemType": "Fee"
          };
          ProcessingFeepayloadarray.push(PFpayload);

          let PF = {
            "Items": ProcessingFeepayloadarray
          }
          let FinlPF = JSON.stringify(PF)

          this.dataService.GetProcessingFee(FinlPF)
            .subscribe(
              (response: any) => {

                response = response.body;
                if (response.APIStatus === 'Success') {
                  this.disableAttribute = true;

                  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                  if (response.Items[0].PaymentType == "CC") {
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'ICF_1';
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = false;
                  }
                  else if (response.Items[0].PaymentType == "ACH") {
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = true;
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'Schedule_Transaction_Fee';
                  }

                  if (this.feeData.modifiedFeeType === "Assigned Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = this.feeData.IntFeePatronId
                    scheduledPaymentsInstallmentsDetails.IntFeeId = null
                  }
                  else if (this.feeData.modifiedFeeType === "Optional Fee") {

                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = null
                    scheduledPaymentsInstallmentsDetails.IntFeeId = this.feeData.IntFeeId
                  }
                  //scheduledPaymentsInstallmentsDetails.TotalProcessingFee = this.TotalProcessingFee;

                  this.ScheduledPaymentslist.push(scheduledPaymentsInstallmentsDetails);
                  console.log('6',this.ScheduledPaymentslist);
                  
                  setTimeout(() => {
                    this.PreAuthAccount = '';
                    this.swiper?.slideNext();
                    this.PreAuthAccount = this.defaultPreAuthAccount;
                    // this.PaymentMethodId = this.defaultPaymentMethodId;
                  }, 1000);
                  for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                    totalamountschduled = Number(totalamountschduled) + Number(this.ScheduledPaymentslist[i].PaymentAmount);
                    totalinstalmentschduled = totalinstalmentschduled + 1;

                  }

                  let payloadarray = [];
                  if (this.IntFeePatronId === 0 || this.IntFeePatronId === null || this.IntFeePatronId === '') {
                    for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                      if (this.ScheduledPaymentslist[i].IntScheduledPaymentId === undefined) {
                        let payload;
                        let date = new Date(this.ScheduledPaymentslist[i].PaymentDate).toLocaleDateString('en-Us');
                        if(this.feeData.selectedAttributeValue)
                        {
                          payload = {
 
                           "IntSiteId": this.feeData.IntSiteId,
                           "IntPatronId": this.feeData.IntPatronId,
                           "IntFeePatronId": null,
                           "IntFeeId": this.feeData.IntFeeId,
                           "PaymentNumber": i + 1,
                           "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                           "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                           "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                           "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                           "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
 
                         };
                        }
                        else
                        {
                          payload = {
 
                           "IntSiteId": this.feeData.IntSiteId,
                           "IntPatronId": this.feeData.IntPatronId,
                           "IntFeePatronId": null,
                           "IntFeeId": this.feeData.IntFeeId,
                           "PaymentNumber": i + 1,
                           "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                           "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                           "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                          // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                           "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
 
                         };
                        }
                        payloadarray.push(payload);
                      }
                    }
                  }
                  else {
                    for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                      if (this.ScheduledPaymentslist[i].IntScheduledPaymentId === undefined) {
                        let payload;
                        let date = new Date(this.ScheduledPaymentslist[i].PaymentDate).toLocaleDateString('en-Us');
                       if(this.feeData.selectedAttributeValue)
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                          "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                       else
                       {
                         payload = {

                          "IntSiteId": this.feeData.IntSiteId,
                          "IntPatronId": this.feeData.IntPatronId,
                          "IntFeePatronId": null,
                          "IntFeeId": this.feeData.IntFeeId,
                          "PaymentNumber": i + 1,
                          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                          "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId,
                         // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                          "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],

                        };
                       }
                        payloadarray.push(payload);
                      }
                    }

                  }


                  let payload = {
                    "ScheduledPayments": payloadarray
                  }

                  this.finalpayload = JSON.stringify(payload)
                  this.myDate = '';
                  this.AmountLeftToSehedule = this.ScheduleAmount = Number(this.ActualAmount) - Number(totalamountschduled);
                  this.remainingAmounttoSehedule = Number(this.ActualAmount) - Number(totalamountschduled);
                  this.remainingInstalmenttoSehedule = Number(this.feeData.Installments) - Number(totalinstalmentschduled);
                  this.InstallmentsLeftToSchedule = Number(this.feeData.Installments) - Number(totalinstalmentschduled);
                  if(this.feeData.CustomFields && this.feeData.CustomFields.length > 0
                    && this.feeData.Installments > this.InstallmentsLeftToSchedule && CustomFieldPopupData)
                  {
                    this.showCustomLink=true;
                  }
                  if (Number(totalamountschduled) === Number(this.ActualAmount) || this.feeData.Installments === 1) {
                    this.array = [];
                    // this.getPaymentMethods();
                    this.onDismiss('refresh');
                  }

                } else {

                }


              },
              (error) => {

                console.log(error);
              }
            )

          //  this.GetProcessingFee(FinlPF);


        }
        else {
          this.alertService.failureToast(this.translate.instant('SF_Schedule_cannot_be_greater_feeamount'));
        }
      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));
      }
    }
  }
  onUpdateSchedule(payload, index) {
    console.log('here',this.feeData.selectedAttributeValue,this.CustomFields)
    
    this.onSelectedchange(this.PaymentMethodId);

    this.finalpayload = ""
    let totalAMounttobeScheduledAmount
    let scheduledPaymentsInstallmentsDetails = new ScheduledPayments();
    let totalamountschduled = 0;
    let totalinstalmentschduled = 0;
    if (this.feeData.modifiedFeeType === "Assigned Fee") {

      totalAMounttobeScheduledAmount = this.feeData.NetAmount
    }
    else if (this.feeData.modifiedFeeType === "Optional Fee") {

      totalAMounttobeScheduledAmount = this.feeData.AmountDue
    }


    let isdateexist: boolean = false;
    if (this.feeData.AllowPartial === false && this.feeData.Installments >= 0 && this.feeData.ScheduledAmount != totalAMounttobeScheduledAmount) {

      for (let i = 0; i < this.array.length; i++) {
        if (index != i) {
          if (this.array[i] === this.datepipe.transform(payload.PaymentDate, 'MM/dd/yyyy')) {
            isdateexist = true;
          }
        }
      }

      if (!isdateexist) {
        if (Number(this.ScheduleAmount) <= Number(this.remainingAmounttoSehedule)) {
          this.ScheduledPaymentslist[index].PaymentAmount = Number(payload.PaymentAmount)
          this.ScheduledPaymentslist[index].PaymentDate = payload.PaymentDate
          this.ScheduledPaymentslist[index].PaymentMethodId = this.PaymentMethodId
          for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
            totalamountschduled = Number(totalamountschduled) + Number(this.ScheduledPaymentslist[i].PaymentAmount);
            totalinstalmentschduled = totalinstalmentschduled + 1;
          }
          this.AmountLeftToSehedule = this.ScheduleAmount = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);
          this.remainingAmounttoSehedule = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);
          let ProcessingFeepayloadarray = [];
          let PFpayload = {
            "IntSiteId": this.feeData.IntSiteId,
            "IntPatronId": this.feeData.IntPatronId,
            "ChargeAmount": Number(payload.PaymentAmount),
            "PaymentType": this.PaymentType,
            "IntItemId": this.feeData.IntFeeId,
            "ItemType": "Fee"
          };
          ProcessingFeepayloadarray.push(PFpayload);

          let PF = {
            "Items": ProcessingFeepayloadarray
          }
          let FinlPF = JSON.stringify(PF)
          this.dataService.GetProcessingFee(FinlPF)
            .subscribe(
              (response: any) => {

                response = response.body;
                if (response.APIStatus === 'Success') {
                  this.disableAttribute = true;
                  // this.TotalProcessingFee = response.Items[0].ProcessingFee.TotalProcessingFee;
                  scheduledPaymentsInstallmentsDetails.TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                  if (response.Items[0].PaymentType == "CC") {
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'ICF_1';
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = false;
                  }
                  else if (response.Items[0].PaymentType == "ACH") {
                    scheduledPaymentsInstallmentsDetails.showPerTransaction = true;
                    scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'Schedule_Transaction_Fee';
                  }
                  let data;
                  data = {
                    "ScheduledPayments": [
                      {
                        "IntScheduledPaymentId": payload.IntScheduledPaymentId,
                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": payload.IntPatronId,
                        "IntFeePatronId": payload.IntFeePatronId,
                        "PaymentNumber": 1,
                        "PaymentAmount": Number(payload.PaymentAmount),
                        "PaymentDate": payload.PaymentDate,
                        "PaymentMethodId": this.PaymentMethodId,
                        "ActiveSw": true,
                        "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:'',
                        "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
        
                      }
                    ]
                  }
                  console.log('Update-Payload',data)
                  this.dataService.updateScheduledPaymentMethod(data)
                  .subscribe(
                    (response: any) => {
                      // this.array = [];
                      this.myDate = [];
                      response = response.body;
                      if (response.APIStatus === 'Success') {
                        this.alertService.successToast(this.translate.instant('SF_Installments_Updated'));
                      } else {
                        if (response.PEProcessingMessages) {
                          if (response.PEProcessingMessages.length === 1) {
                            this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                          }
                          else {
                            this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                            for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                              this.errormessage += response.PEProcessingMessages[i] + ", ";
                            }
                            this.alertService.failureToast(this.errormessage.replace(/,\s*$/, ""));

                          }
                        } else {
                          this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                        }

                      }
                      // this.onDismiss();

                    },
                    (error) => {

                      console.log(error);
                    }
                  )
                } else {

                }
                // this.onDismiss();

              },
              (error) => {

                console.log(error);
              }
            )

        } else {
          this.alertService.failureToast(this.translate.instant('SF_Schedule_cannot_be_greater_feeamount'));
        }
      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));
      }
    }

    else if (this.feeData.AllowPartial === true && this.feeData.Installments >= 0 && this.feeData.ScheduledAmount != totalAMounttobeScheduledAmount && payload.IntScheduledPaymentId === undefined) {

      this.finalpayload = ''
      for (let i = 0; i < this.array.length; i++) {
        if (index != i) {
          if (this.array[i] === this.datepipe.transform(payload.PaymentDate, 'MM/dd/yyyy')) {
            isdateexist = true;
          }
        }
      }

      if (!isdateexist) {
        if (Number(this.ScheduleAmount) <= Number(this.remainingAmounttoSehedule)) {
          this.ScheduledPaymentslist[index].PaymentAmount = Number(payload.PaymentAmount)
          this.ScheduledPaymentslist[index].PaymentDate = payload.PaymentDate
          this.ScheduledPaymentslist[index].PaymentMethodId = this.PaymentMethodId

          let ProcessingFeepayloadarray = [];
          let PFpayload = {
            "IntSiteId": this.feeData.IntSiteId,
            "IntPatronId": this.feeData.IntPatronId,
            "ChargeAmount": Number(payload.PaymentAmount),
            "PaymentType": this.PaymentType,
            "IntItemId": this.feeData.IntFeeId,
            "ItemType": "Fee"
          };
          ProcessingFeepayloadarray.push(PFpayload);

          let PF = {
            "Items": ProcessingFeepayloadarray
          }
          let FinlPF = JSON.stringify(PF)
          this.dataService.GetProcessingFee(FinlPF)
            .subscribe(
              (response: any) => {

                response = response.body;
                if (response.APIStatus === 'Success') {
                  this.disableAttribute = true;
                  // this.TotalProcessingFee = response.Items[0].ProcessingFee.TotalProcessingFee;
                  this.ScheduledPaymentslist[index].TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                  if (response.Items[0].PaymentType == "CC") {
                    this.ScheduledPaymentslist[index].PaymentTypeMsg = 'ICF_1';
                    this.ScheduledPaymentslist[index].showPerTransaction = false;
                  }
                  else if (response.Items[0].PaymentType == "ACH") {
                    this.ScheduledPaymentslist[index].showPerTransaction = true;
                    this.ScheduledPaymentslist[index].PaymentTypeMsg = 'Schedule_Transaction_Fee';
                  }

                  for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                    totalamountschduled = Number(totalamountschduled) + Number(this.ScheduledPaymentslist[i].PaymentAmount);
                    totalinstalmentschduled = totalinstalmentschduled + 1;
                  }
                  this.AmountLeftToSehedule = this.ScheduleAmount = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);
                  this.remainingAmounttoSehedule = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);

                  let payloadarray = [];
                  if (payload.IntFeePatronId === 0 || payload.IntFeePatronId === null || payload.IntFeePatronId === '') {
                    for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                      let date = new Date(this.ScheduledPaymentslist[i].PaymentDate).toLocaleDateString('en-Us');
                      let objpayload = {

                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": this.feeData.IntPatronId,
                        "IntFeePatronId": null,
                        "IntFeeId": this.feeData.IntFeeId,
                        "PaymentNumber": i + 1,
                        "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                        "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                        "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId
                      };
                      payloadarray.push(objpayload);
                    }
                  }
                  else {
                    for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
                      let date = new Date(this.ScheduledPaymentslist[i].PaymentDate).toLocaleDateString('en-Us');
                      let objpayload = {

                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": this.feeData.IntPatronId,
                        "IntFeePatronId": this.IntFeePatronId,
                        "IntFeeId": null,
                        "PaymentNumber": i + 1,
                        "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
                        "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
                        "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId
                      };
                      payloadarray.push(objpayload);
                    }

                  }


                  let objpayload = {
                    "ScheduledPayments": payloadarray
                  }
                  this.finalpayload = JSON.stringify(objpayload)


                } else {

                }
                // this.onDismiss();

              },
              (error) => {

                console.log(error);
              }
            )


        } else {
          this.alertService.failureToast(this.translate.instant('SF_Schedule_cannot_be_greater_feeamount'));
        }
      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));
      }
    }
    else if (Number(this.ActualAmount) === 0) {
      let isdateexist: boolean = false;
      for (let i = 0; i < this.array.length; i++) {
        if (index != i) {
          if (this.array[i] === this.datepipe.transform(payload.PaymentDate, 'MM/dd/yyyy')) {
            isdateexist = true;
          }
        }
      }
      if (!isdateexist) {


        let ProcessingFeepayloadarray = [];
        let PFpayload = {
          "IntSiteId": this.feeData.IntSiteId,
          "IntPatronId": this.feeData.IntPatronId,
          "ChargeAmount": Number(payload.PaymentAmount),
          "PaymentType": this.PaymentType,
          "IntItemId": this.feeData.IntFeeId,
          "ItemType": "Fee"
        };
        ProcessingFeepayloadarray.push(PFpayload);

        let PF = {
          "Items": ProcessingFeepayloadarray
        }
        let FinlPF = JSON.stringify(PF)
        this.dataService.GetProcessingFee(FinlPF)
          .subscribe(
            (response: any) => {

              response = response.body;
              if (response.APIStatus === 'Success') {
                this.disableAttribute = true;
                this.ScheduledPaymentslist[index].TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                if (response.Items[0].PaymentType == "CC") {
                  this.ScheduledPaymentslist[index].PaymentTypeMsg = 'ICF_1';
                  this.ScheduledPaymentslist[index].showPerTransaction = false;
                }
                else if (response.Items[0].PaymentType == "ACH") {
                  this.ScheduledPaymentslist[index].showPerTransaction = true;
                  this.ScheduledPaymentslist[index].PaymentTypeMsg = 'Schedule_Transaction_Fee';
                }
                let data
                if(this.feeData.selectedAttributeValue)
                {
                  data = {
                    "ScheduledPayments": [
                      {
                        "IntScheduledPaymentId": payload.IntScheduledPaymentId,
                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": payload.IntPatronId,
                        "IntFeePatronId": payload.IntFeePatronId,
                        "PaymentNumber": 1,
                        "PaymentAmount": Number(payload.PaymentAmount),
                        "PaymentDate": payload.PaymentDate,
                        "PaymentMethodId": this.PaymentMethodId,
                        "ActiveSw": true,
                        "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                        "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
        
                      }
                    ]
                  }
                }
                else
                {
                  data = {
                    "ScheduledPayments": [
                      {
                        "IntScheduledPaymentId": payload.IntScheduledPaymentId,
                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": payload.IntPatronId,
                        "IntFeePatronId": payload.IntFeePatronId,
                        "PaymentNumber": 1,
                        "PaymentAmount": Number(payload.PaymentAmount),
                        "PaymentDate": payload.PaymentDate,
                        "PaymentMethodId": this.PaymentMethodId,
                        "ActiveSw": true,
                       // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                        "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
        
                      }
                    ]
                  }
                }
               
                console.log('Update-Payload',data)
                this.dataService.updateScheduledPaymentMethod(data)
                  .subscribe(
                    (response: any) => {
                      // this.array = [];
                      this.myDate = [];
                      response = response.body;
                      if (response.APIStatus === 'Success') {
                        this.alertService.successToast(this.translate.instant('SF_Installments_Updated'));
                      } else {
                        if (response.PEProcessingMessages) {
                          if (response.PEProcessingMessages.length === 1) {
                            this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                          }
                          else {
                            this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                            for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                              this.errormessage += response.PEProcessingMessages[i] + ", ";
                            }
                            this.alertService.failureToast(this.errormessage.replace(/,\s*$/, ""));

                          }
                        } else {
                          this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                        }

                      }
                      // this.onDismiss();

                    },
                    (error) => {

                      console.log(error);
                    }
                  )

              } else {

              }
              // this.onDismiss();

            },
            (error) => {

              console.log(error);
            }
          )


      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));
      }

    }
    else {


      for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
        totalamountschduled = Number(totalamountschduled) + Number(this.ScheduledPaymentslist[i].PaymentAmount);
        totalinstalmentschduled = totalinstalmentschduled + 1;
      }
      this.AmountLeftToSehedule = this.ScheduleAmount = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);
      this.remainingAmounttoSehedule = Number(totalAMounttobeScheduledAmount) - Number(totalamountschduled);
      if (this.ActualAmount === 0)
        this.ActualAmount = payload.PaymentAmount
      for (let i = 0; i < this.array.length; i++) {
        if (index != i) {
          if (this.array[i] === this.datepipe.transform(payload.PaymentDate, 'MM/dd/yyyy')) {
            isdateexist = true;
          }
        }
      }

      if (!isdateexist) {
        let ProcessingFeepayloadarray = [];
        let PFpayload = {
          "IntSiteId": this.feeData.IntSiteId,
          "IntPatronId": this.feeData.IntPatronId,
          "ChargeAmount": Number(payload.PaymentAmount),
          "PaymentType": this.PaymentType,
          "IntItemId": this.feeData.IntFeeId,
          "ItemType": "Fee"
        };
        ProcessingFeepayloadarray.push(PFpayload);

        let PF = {
          "Items": ProcessingFeepayloadarray
        }
        let FinlPF = JSON.stringify(PF)

        this.dataService.GetProcessingFee(FinlPF)
          .subscribe(
            (response: any) => {

              response = response.body;
              if (response.APIStatus === 'Success') {
                this.disableAttribute = true;
                // this.TotalProcessingFee = response.Items[0].ProcessingFee.TotalProcessingFee;
                this.ScheduledPaymentslist[index].TotalProcessingFee = Number(response.Items[0].ProcessingFee.TotalProcessingFee).toFixed(2);
                if (response.Items[0].PaymentType == "CC") {
                  this.ScheduledPaymentslist[index].PaymentTypeMsg = 'ICF_1';
                  this.ScheduledPaymentslist[index].showPerTransaction = false;
                }
                else if (response.Items[0].PaymentType == "ACH") {
                  this.ScheduledPaymentslist[index].showPerTransaction = true;
                  this.ScheduledPaymentslist[index].PaymentTypeMsg = 'Schedule_Transaction_Fee';
                }

                if (Number(this.ScheduleAmount) > 0) {
                  let data
                if(this.feeData.selectedAttributeValue)
                {
                  data = {
                    "ScheduledPayments": [
                      {
                        "IntScheduledPaymentId": payload.IntScheduledPaymentId,
                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": payload.IntPatronId,
                        "IntFeePatronId": payload.IntFeePatronId,
                        "PaymentNumber": 1,
                        "PaymentAmount": Number(payload.PaymentAmount),
                        "PaymentDate": payload.PaymentDate,
                        "PaymentMethodId": this.PaymentMethodId,
                        "ActiveSw": true,
                        "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                        "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
        
                      }
                    ]
                  }
                }
                else
                {
                  data = {
                    "ScheduledPayments": [
                      {
                        "IntScheduledPaymentId": payload.IntScheduledPaymentId,
                        "IntSiteId": this.feeData.IntSiteId,
                        "IntPatronId": payload.IntPatronId,
                        "IntFeePatronId": payload.IntFeePatronId,
                        "PaymentNumber": 1,
                        "PaymentAmount": Number(payload.PaymentAmount),
                        "PaymentDate": payload.PaymentDate,
                        "PaymentMethodId": this.PaymentMethodId,
                        "ActiveSw": true,
                       // "IntFeeAdvanceAttributeId":this.feeData.selectedAttributeValue ?this.feeData.selectedAttributeValue:0,
                        "CustomFields": this.CustomFields && this.CustomFields.length > 0 ? this.CustomFields : [],
        
                      }
                    ]
                  }
                }
               
                console.log('Update-Payload',data)
                  this.dataService.updateScheduledPaymentMethod(data)
                    .subscribe(
                      (response: any) => {
                        // this.array = [];
                        this.myDate = [];
                        response = response.body;
                        if (response.APIStatus === 'Success') {
                          this.alertService.successToast(this.translate.instant('SF_Installments_Updated'));
                        } else {
                          if (response.PEProcessingMessages) {
                            if (response.PEProcessingMessages.length === 1) {
                              this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                            }
                            else {
                              this.errormessage = this.translate.instant('ERROR_CONTACT_SUPPORT');
                              for (var i = 0; i < response.PEProcessingMessages.length; i++) {
                                this.errormessage += response.PEProcessingMessages[i] + ", ";
                              }
                              this.alertService.failureToast(this.errormessage.replace(/,\s*$/, ""));

                            }
                          } else {
                            this.alertService.failureToast(this.translate.instant('ERROR_CONTACT_SUPPORT') + " - " + response.PEProcessingMessages[0]);
                          }

                        }

                      },
                      (error) => {

                        console.log(error);
                      }
                    )
                }
                else {
                  this.alertService.failureToast(this.translate.instant('SF_Schedule_cannot_be_greater_feeamount'));
                }

              } else {

              }
              // this.onDismiss();

            },
            (error) => {

              console.log(error);
            }
          )

      }
      else {
        this.alertService.failureToast(this.translate.instant('SF_not_more_than_1_installment'));
      }


    }



  }

  onKeyUp(event: any) {
    const MY_REGEXP = /^[0-9]*(\.[0-9]{0,2})?$/;
    let newValue = event.target.value;
    let regExp = new RegExp(MY_REGEXP);

    if (!regExp.test(newValue)) {
      event.target.value = newValue.slice(0, -1);
    }

  }
  onDeleteSchedule(IntScheduledPaymentId, IntSiteId, IntPatronId, index) {


    if (IntScheduledPaymentId != undefined) {
      this.myDate = [];
      const alert = this.alertController.create({
        header: this.translate.instant('warning'),
        message: this.translate.instant('DeleteSingle'),
        buttons: [
          {
            text: this.translate.instant('No'),
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: this.translate.instant('yes'),
            handler: () => {
              let data = {
                "IntScheduledPaymentId": IntScheduledPaymentId,
                "IntSiteId": IntSiteId,
                "IntPatronId": IntPatronId
              }

              this.dataService.removeScheduledPaymentMethod(data)
                .subscribe(
                  (response: any) => {
                    this.array = [];
                    this.onDismiss('refresh');
                  },
                  (error) => {

                    console.log(error);
                  }
                )
            }
          }

        ]
      });
      alert.then((res) => {
        res.present();
      })
    }
    else {

      let payloadarray = [];
      this.ScheduleAmount = Number(this.ScheduleAmount) + Number(this.ScheduledPaymentslist[index].PaymentAmount)
      this.ScheduledPaymentslist = this.ScheduledPaymentslist.filter(item => item.PaymentDate !== this.ScheduledPaymentslist[index].PaymentDate);

      this.array = []
      for (let i = 0; i < this.ScheduledPaymentslist.length; i++) {
        let date = this.datepipe.transform(this.ScheduledPaymentslist[i].PaymentDate, 'MM/dd/yyyy')
        this.array.push(date);
        let objpayload = {

          "IntSiteId": this.feeData.IntSiteId,
          "IntPatronId": this.feeData.IntPatronId,
          "IntFeePatronId": null,
          "IntFeeId": this.feeData.IntFeeId,
          "PaymentNumber": i + 1,
          "PaymentAmount": Number(this.ScheduledPaymentslist[i].PaymentAmount),
          "PaymentDate": date, //this.ScheduledPaymentslist[i].PaymentDate,
          "PaymentMethodId": this.ScheduledPaymentslist[i].PaymentMethodId
        };
        payloadarray.push(objpayload);
      }
      let payload = {
        "ScheduledPayments": payloadarray
      }

      this.finalpayload = JSON.stringify(payload)
    }
  }

  CancelAll() {

    this.myDate = [];
    const alert = this.alertController.create({
      header: this.translate.instant('warning'),
      message: this.translate.instant('confirm_txt_message'),
      buttons: [

        {
          text: this.translate.instant('No'),
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: this.translate.instant('yes'),
          handler: () => {
            let data = {

              "IntSiteId": this.feeData.IntSiteId,
              "IntPatronId": this.feeData.IntPatronId,
              "IntFeePatronId": this.feeData.IntFeePatronId
            }

            this.dataService.removeAllScheduledPayments(data)
              .subscribe(
                (response: any) => {
                  this.onDismiss('refresh');
                  this.array = [];
                },
                (error) => {

                  console.log(error);
                }
              )
          }
        }
      ]
    });

    alert.then((res) => {
      res.present();
    })



  }
  onInfo(data) {
    let start_date;
    let end_date;
    let class_time
    if(data.Session !=null)
    {
      start_date = (new Date(data.Session.PeriodStartDateTime).getMonth() + 1) + "/" + new Date(data.Session.PeriodStartDateTime).getDate() + "/" +
      new Date(data.Session.PeriodStartDateTime).getFullYear().toString().substr(-2);
      end_date = (new Date(data.Session.PeriodEndDateTime).getMonth() + 1) + "/" + new Date(data.Session.PeriodEndDateTime).getDate() + "/" +
      new Date(data.Session.PeriodEndDateTime).getFullYear().toString().substr(-2);
       class_time = ("0"+new Date(data.Session.PeriodStartDateTime).getHours()).slice(-2) + ":" + ("0"+new Date(data.Session.PeriodStartDateTime).getMinutes()).slice(-2)
        + " to " + ("0"+new Date(data.Session.PeriodEndDateTime).getHours()).slice(-2) + ":" +
        ("0"+new Date(data.Session.PeriodEndDateTime).getMinutes()).slice(-2);
    }
  let days=''
    if (data.Session && data.Session.SessionCode) {
      if (data.Session.SundaySw)
        days = days + "Sun ";
      if (data.Session.MondaySw)
        days = days + "Mon ";
      if (data.Session.TuesdaySw)
        days = days + "Tue ";
      if (data.Session.WednesdaySw)
        days = days + "Wed ";
      if (data.Session.ThursdaySw)
        days = days + "Thu ";
      if (data.Session.FridaySw)
        days = days + "Fri ";
      if (data.Session.SaturdaySw)
        days = days + "Sat";

    }
    let message = '<span>' + this.translate.instant('fee_inf_name') + data.FeeName + '</span><br>';
    // data.FeeDescription ? message +'<span>' + this.translate.instant('fee_description') + data.FeeDescription + '</span><br>':'';
    if(data.FeeDescription)
    {
      message= message +'<span>' + this.translate.instant('fee_description') + data.FeeDescription + '</span><br>';
    }
    if(data.Session &&data.Session.SessionName)
    {
      message= message +'<span>' + this.translate.instant('session_name') + data.Session.SessionName + '</span><br>';
    }
    if(data.Session && data.Session.SessionCode)
    {
      message=message +'<span>' + this.translate.instant('session_code') + data.Session.SessionCode + '</span><br>'
    }
    if(data.Session && data.Session.CategoryName)
    {
      message=message +'<span>' + this.translate.instant('session_category') + data.Session.CategoryName + '</span><br>'
    }
    if(data.Session && data.Session.Location)
    {
      message= message +'<span>' + this.translate.instant('location') + data.Session.Location + '</span><br>'
    }
    if(data.Session && start_date)
    {
      message=message +'<span>'+ this.translate.instant('start_date') + " and " + this.translate.instant('end_date') + ": " + '</span><br>' + start_date + "-" + end_date + '</span><br>'
    }
    if(data.Session && days)
    {
      message=message +'<span>' + this.translate.instant('class_days') +  days.split(" ").join(", ") + '</span><br>'
    }
    if(data.Session && class_time)
    {
      message= message +'<span>'+ this.translate.instant('class_timings') + class_time + '</span><br>'
    }
    this.alertService.alert(this.translate.instant('Fee_Details'), message);
  }

  async showCustomFieldsModal(CustomFiledLink?, payload?, index?) {
    // console.log(this.feeData, payload,CustomFiledLink)
    if(payload !== undefined){
      let date = new Date(payload.PaymentDate).toLocaleDateString('en-Us');
      payload.PaymentDate = date;
    }
    this.feeData.ScheduledAmount = Number(this.ScheduleAmount);
    this.feeData.IntScheduledPaymentId = payload && payload.length > 0? payload[0].IntScheduledPaymentId : null;
    if((this.feeData.CustomFields && this.feeData.CustomFields.length > 0
      && this.feeData.Installments == this.InstallmentsLeftToSchedule) || 
      (CustomFiledLink =='CustomFiledLink' && this.feeData.CustomFields && this.feeData.CustomFields.length > 0) ||
      (this.feeData.modifiedFeeType === "Assigned Fee" && this.InstallmentsLeftToSchedule == this.feeData.Installments && this.feeData.CustomFields && this.feeData.CustomFields.length > 0)) {
      const modal = await this.modalController.create({
        component: CustomFieldsComponent,
        cssClass: 'custom-fields-modal',
        componentProps: {
          selectedFees: this.feeData,
          editMode: CustomFiledLink == 'CustomFiledLink' || this.feeData.modifiedFeeType === "Assigned Fee" ? true : false,
          methodId: this.PaymentMethodId,
          buttontype:'schedule'
        }
      });
      modal.onDidDismiss()
      .then((data) => {
        console.log('CustomFiledLink',CustomFiledLink)
        if(data && data['data']) {
          let response = data['data'].response;
          let mode = data['data'].editMode;
          // if(mode)
          //  this.events.publish('updated fields', true);
          this.CustomFields = response.customfields;
          if(CustomFiledLink=='CustomFiledLink') {
            
          }
         if(CustomFiledLink=='onAddSchedule') {
          this.onAddScheduleFuction(response)
          }
          if(CustomFiledLink == "AssignedFee") {
            console.log(payload);
            this.onUpdateSchedule(payload, index);
          }
          // this.onAddSchedule(response)
        }
    });
      return await modal.present();
    } else {
      if(this.feeData.CustomFields !== null && this.feeData.CustomFields.length >0){
        this.fetchCustomFields(this.feeData.CustomFields)
      }
      if(CustomFiledLink=='onAddSchedule') {
        this.onAddSchedule();
        }
        if(CustomFiledLink == "AssignedFee") {
          console.log(payload);
         
          this.onUpdateSchedule(payload, index);
        }
    }

    
  }

  fetchCustomFields(data){
    
    this.CustomFields = [];
    console.log(data);
    for(let i = 0; i < data.length; i++) {
       if(data[i].UserValue !== "" && data[i].UserValue !== undefined && data[i].UserValue !== null){
        let field = {
          IntFeeCustomFieldId: data[i].IntFeeCustomFieldId,
          FieldValue: data[i].UserValue,
          IntFeeCustomFieldOptionId: null
        }
        this.CustomFields.push(field);
       }else if(data[i].UserValue === ""){
      let selectedvalue =  data[i].Options.filter((e) =>e.IsSelected === true);
        if(selectedvalue){
          let field = {
            IntFeeCustomFieldId: data[i].IntFeeCustomFieldId,
            FieldValue: data[i].UserValue,
            IntFeeCustomFieldOptionId: selectedvalue.length === 0 ? "" :selectedvalue[0].IntFeeCustomFieldOptionId
          }
          this.CustomFields.push(field);
        }
        
       }
    }
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
    if(this.myDate){
      const date = new Date(this.myDate);
      date.setDate(date.getDate() + 1);
      this.scheduleDate = date.toISOString();
    }else{
      this.scheduleDate = this.minDate;
    }
  }
  selectDate(date, i) {
    
    this.myDate = this.datepipe.transform(date.detail.value, 'MM/dd/yyyy');
    this.toggleVisibility(i);
    console.log("date", this.myDate)
  }
}

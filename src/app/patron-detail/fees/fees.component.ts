import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { SharedService } from './../../services/shared/shared.service';
import { DataService } from './../../services/data/data.service';
import { ScheduleFeesPage } from './../../schedule-fees/schedule-fees.page';
import { ModalController, AlertController, Platform, NavController } from '@ionic/angular';
import { LanguageService } from './../../services/language/language.service';
import { AlertService } from './../../services/alert/alert.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ScheduledPaymentsInstallmentsDetails } from 'src/app/services/data/model/schedulefee';
import { NgForm } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FundraiserInfoPopUpComponent } from 'src/app/fundraiser-info-pop-up/fundraiser-info-pop-up.component';
import { EventService } from 'src/app/serviceEvent/event.service';
// import { FeeOptional} from './../../services/shared/shared.service';
import { FeeOptional } from 'src/app/services/data/model/patronfee';
import { CustomFieldsComponent } from 'src/app/custom-fields/custom-fields.component';
import { AddToCartPopupComponent } from 'src/app/add-to-cart-popup/add-to-cart-popup.component';
import { AppConfiguration } from '../../app-configuration';
// import { Events } from '@ionic/angular';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss'],
})
export class FeesComponent implements OnInit {
  patrons: any;
  selectedPatronData: any;
  FirstName: string;
  LastName: string;
  IntPatronId: any;
  selectedFeeType = '0';
  assignedFeesCartItems: any;
  optionalFeesCartItems: any;
  cartItems: any;
  fees: any;
  defaultValue = [];
  nonDefaultValue = [];
  ViewPayments: any;
  selectedPaymentMethodId: any;
  PaymentType: any;
  PreAuthAccount: any;
  PaymentMethodId: any;
  FeesForScheduledPayments = []
  ScheduledPaymentMethod = [];
  FilteredFeesForScheduledPayments = []
  FilteredScheduledPaymentMethod = [];
  paymentcheckoutresponse: any
  ScheduledPayments: boolean = false;
  allAssignedFees: any;
  individualAssignedFees: any;
  allOptionalFees: any;
  individualOptionalFees: any;
  searchText: string;
  searchPaidFees: string;
  Active: any = true;
  cartCount: number;
  selectedDateType = "30";
  enddate = new Date();
  startdate;
  IsFormValid: boolean = true;
  selectStartDate;
  selectEndDate;
  StartDate = new Date();
  PaidFeeslist = [];
  paymentResponse: FeeOptional;
  ModifiedPaidFeesArray: any;
  paidFees = false;
  fullDataArray: any;
  districtFeaturelist: any;
  SessionCategories = [];
  attributeSelectedError:boolean=false;
  addToCartPopupComponent : AddToCartPopupComponent;
  amount: any;
  quikappsBaseUrl: string;
  editmode: boolean = false;
  sortOptions =[];
  AssignedFeeSortOptions =[];
  AllFeesortOptions =[];
  paidFeeSortOptions = [];
  selectedSorting: string='';

  allFeesDetaillist = [];
  assignedFeesCount = false;
  optionalFeesCount = false;
  scheduledFeesCount = false;
  spotFeesCount = false;
  variableFeesCount = false;
  FeesTypes = [];
  
  days = [
    { id: "7", date: this.translate.instant('7_days') },
    { id: "30", date: this.translate.instant('30_days') },
    { id: "90", date: this.translate.instant('90_days') },
    { id: "Custom Date", date: this.translate.instant('Custom_Date') },
  ]
  @ViewChild("ion-alert", { static: false }) feesAlert;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;
  constructor(public alertService: AlertService,
    private router: Router,
    public languageService: LanguageService,
    private modalController: ModalController,
    private alertController: AlertController,
    private sharedService: SharedService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private keyboard: Keyboard,
    private platform: Platform,
    private navCtrl: NavController,
    private events: EventService,
    private appConfiguration: AppConfiguration,
  ) { 
    this.quikappsBaseUrl = this.appConfiguration.quikappsBaseUrl;
  }

  ngOnInit() {

    // this.FeesTypes = [
    //   { value: this.translate.instant('all_fees'), option: '0'},
    //   { value: this.translate.instant('assigned_fees'), option: '1'},
    //   { value: this.translate.instant('optional_fees'), option: '2'},
    //   { value: this.translate.instant('scheduled_fees'), option: '5'},
    //   { value: this.translate.instant('variable_fees'), option: '3'},
    //   { value: this.translate.instant('spot_fees'), option: '4' }
    // ];
    this.keyboard.onKeyboardShow().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fees')) {
        let feesAlert = document.getElementsByTagName('ion-alert')[0];
        feesAlert.classList.add("movealert_up");
      }
    });
    this.keyboard.onKeyboardHide().subscribe(() => {
      if (this.platform.is('ios') && (this.router.url == '/dashboard/patron-detail/fees')) {
        let feesAlert = document.getElementsByTagName('ion-alert')[0];
        feesAlert.classList.remove("movealert_up");
      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getUserPatrons()    
   });
  //  this.events.subscribe('updated fields', (data) => {
  //   if(data == true) {
  //     this.getUserPatrons();
  //   }
  // });

  this.selectedSorting='';

  const AllFeesortOptions =[
    { value: 'Fee Name', option: 'fee_name' },
    { value: 'Amount Due', option: 'amount_due' },
    { value: 'End Date', option: 'end_date' },
  ];

  this.AssignedFeeSortOptions = [
        { value: 'Fee Name', option: 'fee_name' },
        { value: 'Amount Due', option: 'amount_due'},
    ];

  this.paidFeeSortOptions = [
    { value: 'Fee Name', option: 'fee_name' },
    { value: 'Paid Date', option: 'paid_date'},
  ];

  
  this.sortOptions = AllFeesortOptions;
  this.AllFeesortOptions = AllFeesortOptions;
  }

  onDateChange(selectedDate) {
    this.ModifiedPaidFeesArray = [];
    this.paidFees = false;
    this.fullDataArray = [];
    if (selectedDate != 'Custom Date') {
      const datePipe = new DatePipe('en-US');
      this.startdate = new Date();
      this.enddate = new Date();
      this.startdate.setDate(this.startdate.getDate() - selectedDate);
      let reqObj = {
        StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
        EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy')
      };
      this.getPaidUserPatronFees(reqObj)
    }
  }

  startDateChange(SD, f: NgForm) {

    this.startdate = this.datePipe.transform(SD, 'MM/dd/yyyy');
    this.selectEndDate = this.datePipe.transform(this.selectEndDate, 'MM/dd/yyyy');
    // this.StartDate = SD;
    if (new Date(this.startdate) > new Date(this.selectEndDate)) {
      // const message = this.translate.instant('rp_err_msg_1');
      // this.alertService.failureToast(message);
      this.IsFormValid = false
    }
    else {
      this.IsFormValid = true
    }

  }

  endDateChange(END, f: NgForm) {
    this.selectEndDate = END;
    if (new Date(this.startdate) > new Date(this.selectEndDate)) {
      this.IsFormValid = false
    }
    else {
      this.IsFormValid = true
    }

  }

  getPaymentHistoryForCustomDates() {
    let reqObj = {
      StartDate: this.selectStartDate,
      EndDate: this.selectEndDate
    };
    this.startdate = this.selectStartDate,
      this.enddate = this.selectEndDate,
      reqObj.StartDate = this.datePipe.transform(this.selectStartDate, 'MM/dd/yyyy')
    reqObj.EndDate = this.datePipe.transform(this.selectEndDate, 'MM/dd/yyyy')
    this.getPaidUserPatronFees(reqObj)
  }

  onInfo(data) {
    let start_date;
    let end_date;
    let class_time
    if(data.Session !=null)
    {
      console.log(new Date(data.Session.PeriodStartDateTime), data.FeeName,  "fee name")
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
      message= message +'<span>' + this.translate.instant('fee_description') + data.FeeDescription + '</span><br>';
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

  async OpenInfoPopUp(data) {
    if(data['FeeImage'] === undefined){
        data['FeeImage'] =null;   
       }
    const modal = await this.modalController.create({
      component: FundraiserInfoPopUpComponent,
      cssClass: 'add-to-cart-modal',
      componentProps: {
        fee: data,
      }
    });

    await modal.present();
    return modal;
  }

  onInfoPaidFees(data) {
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
      message=message +'<span>' + this.translate.instant('class_days') + days.split(" ").join(", ") + '</span><br>'
    }
    if(data.Session && class_time)
    {
      message= message +'<span>'+ this.translate.instant('class_timings') + class_time + '</span><br>'
    }
    this.alertService.alert(this.translate.instant('Fee_Details'), message);
  }

  getPaidUserPatronFees(payload) {
    this.ModifiedPaidFeesArray = [];
    this.paidFees = false;
    this.fullDataArray = [];
    this.sharedService.loading.next(true);
    this.dataService.getPaidUserPatronFees(payload)
      .subscribe(
        (response: any) => {
          const selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
          this.paymentResponse = response.body;
          this.sharedService.loading.next(false);
          const paidFeeArray = [];
          const ModifiedPaidFeesArray = [];
          this.paymentResponse.Patrons.forEach((patronData) => {
            patronData.PaidFees.forEach((paidFee) => {
              const obj = {
                "IntPatronId": patronData.IntPatronId,
                "FirstName": patronData.FirstName,
                "LastName": patronData.LastName,
                "FeeName": paidFee.FeeName,
                "FeeType": paidFee.Optional === false ? "Assigned Fee" : "Optional Fee" ,
                "FeeDescription": paidFee.FeeDescription,
                "Transactions": paidFee.Transactions,
                "FeeCategory": paidFee.FeeCategory,
                "DueDate": paidFee.DueDate
              }

              if (selectedPatronData.type == 'individual' && selectedPatronData.data.IntPatronId == patronData.IntPatronId) {
                paidFeeArray.push(obj);
              } else if (selectedPatronData.type == 'all') {
                paidFeeArray.push(obj);
              }

            })
          })

          paidFeeArray.forEach((data) => {
            data.Transactions.forEach((transaction) => {
              const obj = {
                "IntPatronId": data.IntPatronId,
                "FirstName": data.FirstName,
                "LastName": data.LastName,
                "FeeName": data.FeeName,
                "FeeType": data.FeeType,
                "FeeDescription": data.FeeDescription,
                "FeeCategory": data.FeeCategory,
                "DueDate": data.DueDate,
                "TransactionAmount": transaction.Amount,
                "TransactionDate": transaction.TransactionDate

              }
              ModifiedPaidFeesArray.push(obj);
            });
          })
          this.ModifiedPaidFeesArray = this.sortByTransactionDate(ModifiedPaidFeesArray);
          this.ModifiedPaidFeesArray = this.sortByKey(this.ModifiedPaidFeesArray, 'FirstName');
          this.fullDataArray = ModifiedPaidFeesArray;
            this.paidFees = true;
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error)
        }
      );
  }

  ionViewWillEnter() {
    this.FeesTypes = [
      { value: this.translate.instant('all_fees'), option: '0'},
      { value: this.translate.instant('assigned_fees'), option: '1'},
      { value: this.translate.instant('optional_fees'), option: '2'},
      { value: this.translate.instant('scheduled_fees'), option: '5'},
      { value: this.translate.instant('variable_fees'), option: '3'},
      { value: this.translate.instant('spot_fees'), option: '4' }
    ];
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.selectEndDate = new Date().toISOString();
    this.selectedDateType = "30";
    this.startdate = new Date();
    this.enddate = new Date();
    this.startdate.setDate(this.startdate.getDate() - 30);
    this.enddate.setDate(this.enddate.getDate());
    this.Active = true;
    const datePipe = new DatePipe('en-US');
    let onloadrequestdata = {
      StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
      EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
      ReportType: "All"
    };
    this.getPaidUserPatronFees(onloadrequestdata)

    this.getUserPatrons();
    this.selectedPatronData = this.sharedService.getselectPatronWithData();
    const selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
    if (this.selectedPatronData && !selectedPatron) {
      localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
    } else {
      this.selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
  }


  /** get all cart items */
  getCartItems() {
    this.dataService.getCartItems()
      .subscribe(
        (response: any) => {
          this.sharedService.getCartCount(response);
          this.sharedService.loading.next(false);
          const cartItems = response.body.Patrons;
          // console.log(response.body.Patrons);
          const assignedFeesPaymentsModifiedArray = [];
          const optionalFeesPaymentsModifiedArray = [];
          cartItems.forEach((cartItem) => {
            cartItem.AssignedFees.forEach((Payment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "FeeDescription": Payment.FeeDescription,
                "FeeType": Payment.FeeType,
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "AmountDue": Payment.AmountDue,
                "AdjustedAmountDue": Payment.AdjustedAmountDue,
                "AdjustmentReason": Payment.AdjustmentReason,
                "AmountPaid": Payment.AmountPaid,
                "CartAmount": Payment.CartAmount,
                "AssignedDate": Payment.AssignedDate,
                "DueDate": Payment.DueDate,
                "AddedCartAmount": Payment.AddedCartAmount,
                "DiscountAmount": Payment.DiscountAmount,
                "selectedAttributeValue":Payment.IntFeeAttributeId,
                "CustomFields":Payment.CustomFields?Payment.CustomFields:null,
              }
              assignedFeesPaymentsModifiedArray.push(obj);
            })

            cartItem.OptionalFees.forEach((Payment) => {
              const obj = {
                "IntSiteId": cartItem.IntSiteId,
                "IntPatronId": cartItem.IntPatronId,
                "IntUserId": cartItem.IntUserId,
                "IntPatronCartId": Payment.IntPatronCartId,
                "IntFeePatronId": Payment.IntFeePatronId,
                "IntFeeId": Payment.IntFeeId,
                "FeeName": Payment.FeeName,
                "FeeCode": Payment.FeeCode,
                "FeeDescription": Payment.FeeDescription,
                "FeeType": Payment.FeeType,
                "IsPaid": Payment.IsPaid,
                "Active": Payment.Active,
                "AmountDue": Payment.AmountDue,
                "AdjustedAmountDue": Payment.AdjustedAmountDue,
                "AdjustmentReason": Payment.AdjustmentReason,
                "AmountPaid": Payment.AmountPaid,
                "CartAmount": Payment.CartAmount,
                "AssignedDate": Payment.AssignedDate,
                "DueDate": Payment.DueDate,
                "AddedCartAmount": Payment.AddedCartAmount,
                "DiscountAmount": Payment.DiscountAmount,
                "selectedAttributeValue":Payment.IntFeeAttributeId,
                "CustomFields":Payment.CustomFields?Payment.CustomFields:null,
              }
              optionalFeesPaymentsModifiedArray.push(obj);
              // if (Payment.FeeName == 'test_iphone'){
              //   console.log(Payment);
              // }
            })
          })
        
          this.assignedFeesCartItems = assignedFeesPaymentsModifiedArray;
          this.optionalFeesCartItems = optionalFeesPaymentsModifiedArray;
          this.cartItems = cartItems;
          // this.optionalFeesCartItems.forEach((item)=>{
          //   if (item.FeeName == 'test_iphone'){
          //     console.log(item);
          //   }
          // })
          if (this.selectedPatronData && this.selectedPatronData.type == 'individual') {
            this.getIndividualAssignedFees();
            this.IntPatronId = this.selectedPatronData.data.IntPatronId;
          } else {
            this.getAllAssignedFees();
            this.IntPatronId = "";
          }
        }
      )
  }

  onGotoCart() {
    this.navCtrl.navigateRoot(['/dashboard/cart']);
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  onSelectedTypeChange() {
    this.selectedSorting='';
    let variableFee = [];
    let spotFee = [];
    let scheduledFee = [];
    let fees:any;
    if (this.selectedPatronData.type == 'individual') {
      if(this.individualAssignedFees.length > 0){
        fees = this.individualAssignedFees;
        if(this.individualOptionalFees.length > 0){
          fees = this.individualAssignedFees.concat(this.individualOptionalFees)
        }
      }
    }
    else {
      if(this.allAssignedFees.length > 0){
        fees = this.allAssignedFees;
        if(this.allOptionalFees.length > 0){
          fees = this.allAssignedFees.concat(this.allOptionalFees)
        }
      }
    }
    if(fees){
    variableFee = fees.filter((fee) => {
          if (fee.VariablePricedSw == true) {
            return fee;
          }
        });

        spotFee = fees.filter((fee) => {
          if (fee.LimitedSpotsAvailable == true) {
            return fee;
          }
        });

        scheduledFee = fees.filter((fee) => {
          if (fee.modifiedFeeType === 'Assigned Fee' && fee.ScheduledAmount > 0) {
            return fee;
          }
        });

        if(variableFee.length > 0) this.variableFeesCount = true;
        if(spotFee.length > 0) this.spotFeesCount = true;
        if(scheduledFee.length > 0) this.scheduledFeesCount = true; 
      }
    this.sharedService.loading.next(true);
    if (this.selectedFeeType == '0') {
      this.sortOptions = this.AllFeesortOptions;
      if (this.selectedPatronData.type == 'individual') {
        this.fees = this.individualAssignedFees.concat(this.individualOptionalFees);
      } else {
        this.fees = this.allAssignedFees.concat(this.allOptionalFees);
      }
    } else if (this.selectedFeeType == '1') {
      this.sortOptions = this.AssignedFeeSortOptions;
      if (this.selectedPatronData.type == 'individual') {
        this.fees = this.individualAssignedFees;
      } else {
        this.fees = this.allAssignedFees;
      }
    } else if (this.selectedFeeType == '2') {
      this.sortOptions = this.AllFeesortOptions;
      if (this.selectedPatronData.type == 'individual') {
        this.fees = this.individualOptionalFees;
      } else {
        this.fees = this.allOptionalFees;
      }
    } else if (this.selectedFeeType == '3') {
      this.sortOptions = this.AllFeesortOptions;
      this.fees = variableFee;
    } else if (this.selectedFeeType == '4') {
      this.sortOptions = this.AllFeesortOptions;
      this.fees = spotFee;
    } else if (this.selectedFeeType == '5') {
      this.sortOptions = this.AllFeesortOptions;
      this.fees = scheduledFee;
    } else if (this.selectedFeeType == '6') {
      this.sortOptions = this.paidFeeSortOptions;
      this.onDateChange('30')
    } else if (this.selectedFeeType >= '7') {
      this.sortOptions = this.AllFeesortOptions;
      if (this.selectedPatronData.type == 'individual') {
        const index = this.SessionCategories.findIndex(x => x.value.toString() == this.selectedFeeType.toString());
        const filteredFees = this.individualOptionalFees.filter((fee) => {
          if (fee.SessionCategory === this.SessionCategories[index].SessionCategory) {
            return fee;
          }
        })
        this.fees = filteredFees;
      } else {
        const index = this.SessionCategories.findIndex(x => x.value.toString() == this.selectedFeeType.toString());
        const filteredFees = this.allOptionalFees.filter((fee) => {
          if (fee.SessionCategory === this.SessionCategories[index].SessionCategory) {
            return fee;
          }
        })
        this.fees = filteredFees;
      }
    }
    if (this.selectedFeeType != '5') {
      this.filterAllFees(this.fees);
    }
    this.filterFees(this.searchText, '');
    this.sharedService.loading.next(false);
  }

  filterAllFees(fees) {
    this.sharedService.loading.next(true);
    const filteredFees = fees.filter((fee) => {
      if ((!(!fee.isPatronActive && fee.modifiedFeeType == 'Optional Fee') && (fee.NetAmount != fee.ScheduledAmount)) || (!(!fee.isPatronActive && fee.modifiedFeeType == 'Optional Fee') && (fee.VariablePricedSw))) {
        return fee;
      }
    })
    if (this.selectedFeeType == '2') {
      this.fees = filteredFees;
    }
   
    console.log("final fees ",this.fees)
    this.sharedService.loading.next(false);
  }

  async onScheduleFees(feeData) {
    console.log('this.ScheduledPaymentMethod',this.ScheduledPaymentMethod)
    const modal = await this.modalController.create({
      component: ScheduleFeesPage,
      componentProps: {
        feeData: feeData,
        ScheduledPaymentMethodData: this.ScheduledPaymentMethod,
        FeesForScheduledPayments: this.FeesForScheduledPayments,
        paymentMethods: this.ViewPayments
      }
    });

    modal.onDidDismiss()
      .then((dismissData) => {
        if (dismissData.data == 'refresh') {
          this.getUserPatrons();
        }
      });
    return await modal.present();
  }

  async openAddToCartModal(fee, isDisabled) {
    const modal = await this.modalController.create({
      component: AddToCartPopupComponent,
      cssClass: 'add-to-cart-modal',
      componentProps: {
        fee: fee,
        firstName: this.FirstName,
        lastName: this.LastName,
        isDisabled: isDisabled,
        userDropDown:[],
      }
    });

    await modal.present();
    return modal;
  }


  async openCustomFieldsModal(fee,cart?) {
    // console.log(fee);
    const modal = await this.modalController.create({
      component: CustomFieldsComponent,
      cssClass: 'custom-fields-modal',
      componentProps: {
        selectedFees: fee,
        editMode: this.editmode,
        methodId: this.PaymentMethodId,
        buttontype:cart
      }
    });

    await modal.present();
    return modal;
  }

  /** show popup on click of edit/add icons */
  async presentAlertConfirm(fee) {
    let isDisabled = false;
    let inputValue = null;
    // if(fee.CartAmount){
    //   this.editmode = true;
    // } else {
    //   this.editmode = false;
    // }
    console.log(fee);
    if(fee.CustomFields) {  
        let customTextData=fee.CustomFields.filter(value=> value.Type === "Text Field"  ||  value.Type === "Text Area");
        let CustomOptionData = fee.CustomFields.filter(value=> value.Type =="Checkbox"|| value.Type == "List" || value.Type =='Dropdown' || value.Type =='Radio Button');
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
      if((CustomFieldsText && CustomFieldsText.length > 0) || (CustomFieldsOption && CustomFieldsOption.length > 0))
      {
        this.editmode=true;
      } else {
        this.editmode=false;
      }
    }

    if (fee.modifiedFeeType == 'Assigned Fee') {

      if (fee.LimitedSpotsAvailable) {
        inputValue = fee.AmountDue;
        isDisabled = true;
      } else if (fee.VariablePricedSw) {
        inputValue = null;
        isDisabled = false;
      } else if (!fee.VariablePricedSw && !fee.LimitedSpotsAvailable && fee.AmountDue == 0) {
        inputValue = 0;
        isDisabled = true;
      } else if (fee.AllowPartial) {
        inputValue = fee.CartAmount ? fee.CartAmount : (fee.NetAmount - fee.ScheduledAmount);
        isDisabled = false;
      } else {
        // inputValue = fee.NetAmount - fee.AmountPaid;
        inputValue = fee.NetAmount;
        isDisabled = true;
      }
    } else if (fee.modifiedFeeType == 'Optional Fee') {
      if (fee.LimitedSpotsAvailable) {
        inputValue = fee.AmountDue;
        isDisabled = true;
      } else if (fee.VariablePricedSw) {
        inputValue = fee.CartAmount ? fee.CartAmount : null;
        isDisabled = false;
      } else if (!fee.VariablePricedSw && !fee.LimitedSpotsAvailable && fee.AmountDue == 0) {
        inputValue = 0;
        isDisabled = true;
      } else if (fee.AllowPartial) {
        inputValue = fee.CartAmount ? fee.CartAmount : (fee.AmountDue - fee.ScheduledAmount)
      } else {
        inputValue = fee.AmountDue;
        isDisabled = true;
      }
      // console.log(fee);
    }
    let alert = await this.openAddToCartModal(fee, isDisabled);
    alert.onDidDismiss().then(async result => {
      if (result.data && result.data.response.saveFee == "Success") {
        this.amount = result.data.response.amount;

        if (!fee.VariablePricedSw && !fee.LimitedSpotsAvailable && fee.AmountDue == 0) {
          // here - check this if condition
          if (fee.CustomFields && fee.CustomFields.length > 0) {
            let modalRef = await this.openCustomFieldsModal(fee,'cart');
            modalRef.onDidDismiss().then(result => {
              if (result.data && result.data.response) {
                let customFields = result.data.response.customfields;
                this.saveFeePayments(fee, customFields);
              }
            });
          } else {
            this.saveFeePayments(fee);
          }
        } else {
          if (this.amount == 0 || this.amount == '' || this.amount.length > 15) {
            this.alertService.failureToast(this.translate.instant('enter_vld_amt1'));
            // return false;
          } else {
            if (fee.LimitedSpotsAvailable) {
              console.log(2);
              if (fee.CustomFields && fee.CustomFields.length > 0) {
                let modalRef = await this.openCustomFieldsModal(fee,'cart');
                modalRef.onDidDismiss().then(result => {
                  if (result.data && result.data.response) {
                    let customFields = result.data.response.customfields;
                    this.spotFeeAlert(fee, customFields);
                  }
                });
              } else {
                this.spotFeeAlert(fee);
              }
            } else {
              let conditionCheckFlag;
              if (fee.VariablePricedSw) {
                conditionCheckFlag = (this.amount == 0 || this.amount == '');
              } else {
                conditionCheckFlag = this.amount == '' || this.amount == 0 || parseInt(this.amount) > fee.AmountDue
              }
              if (conditionCheckFlag) {
                if (parseInt(this.amount) > fee.AmountDue) {
                  this.alertService.failureToast(this.translate.instant('pay_amount'));
                } else {
                  this.alertService.failureToast(this.translate.instant('enter_vld_amt1'));
                }
                // return false;
              } else {
                if (fee.CustomFields && fee.CustomFields.length > 0) {
                  let modalRef = await this.openCustomFieldsModal(fee,'cart');
                  modalRef.onDidDismiss().then(result => {
                    if (result.data && result.data.response) {
                      let customFields = result.data.response.customfields;
                      this.saveFeePayments(fee, customFields);
                    }
                  });
                } else {
                  this.saveFeePayments(fee);
                }
              }
            }
          }
        }
      }
      return this.saveFeePayments
    });
  }

  async spotFeeAlert(feeData, customFields=null) {
    this.modalController.dismiss();
    const alert = await this.alertController.create({
      header: this.translate.instant('warning'),
      message: this.translate.instant('purchase_limit'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            this.presentAlertConfirm(feeData);
          }
        },
        {
          text: this.translate.instant('ok'),
          handler: () => {
            if (customFields && customFields.length > 0) {
              this.saveFeePayments(feeData, customFields);
            } else {
              this.saveFeePayments(feeData);
            }
          }
        }

      ]
    });

    await alert.present();
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

          if (patrons.length > 1) {
            this.patrons = allStudentArray.concat(patrons);
          } else {
            this.patrons = patrons;
          }
          if (this.selectedPatronData.type == 'individual') {
            patrons.forEach((patron, index) => {
              if (patron.IntPatronId == this.selectedPatronData.data.IntPatronId) {
                setTimeout(() => {
                  this.widgetsContent.nativeElement.scrollLeft = ((index + 1) * 50) + 30;
                }, 2000)
              }
            })
          }
          this.getCartItems();
          this.getPaymentMethods();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }


  onSelectedStudent(data) {

    this.getUserPatrons();
    this.selectedPatronData = {
      "type": data.IntPatronId == "" ? "all" : "individual",
      "data": data
    }
    this.FirstName = this.selectedPatronData.data.FirstName;
    this.LastName = this.selectedPatronData.data.LastName;
    this.Active = this.selectedPatronData.data.Active;
    localStorage.setItem('selectedPatron', JSON.stringify(this.selectedPatronData));
  }

  /** get all students assigned fees */
  getAllAssignedFees() {
    this.sharedService.loading.next(true);
    this.dataService.getUserPatronFees()
      .subscribe(
        (response: any) => {
          const userPatronFees = response.body.UserPatronFees;
          const modifiedAllAssigedFeesArray = [];
          if(userPatronFees.length > 0 && this.assignedFeesCount == false){
            this.assignedFeesCount = true;
            console.log("assigned fee");
          }
          userPatronFees.forEach((userPatronFee) => {
            userPatronFee.PatronFees.forEach((patronFee) => {
              patronFee.name = this.getPatronName(patronFee.IntPatronId);
              patronFee.isPatronActive = this.getPatronStatus(patronFee.IntPatronId);
              patronFee.modifiedFeeType = 'Assigned Fee';
              patronFee.IntSiteId = userPatronFee.IntSiteId;
              patronFee.Attribute=patronFee.Attribute ? patronFee.Attribute: null;
              patronFee.selectedAttributeValue=patronFee.IntFeeAttributeId
              patronFee.CustomFields=patronFee.CustomFields && patronFee.CustomFields.length > 0 ? patronFee.CustomFields: null,
              patronFee.EndDate = patronFee.EndDate;

              modifiedAllAssigedFeesArray.push(patronFee);
            })
          })
          this.mergeCartAndAllAssignedFees(this.assignedFeesCartItems, modifiedAllAssigedFeesArray)
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  getPatronName(IntPatronId) {
    const filterredPatron = this.patrons.filter((patron) => {
      if (patron.IntPatronId == IntPatronId) {
        return patron;
      }
    })

    return filterredPatron[0].FirstName + " " + filterredPatron[0].LastName;
  }

  getPatronStatus(IntPatronId) {
    const filterredPatron = this.patrons.filter((patron) => {
      if (patron.IntPatronId == IntPatronId) {
        return patron;
      }
    })

    return filterredPatron[0].Active;
  }
  /** get individual student assigned fees */
  getIndividualAssignedFees() {
    const reqObj = {
      "IntSiteId": this.selectedPatronData.data.IntSiteId,
      "IntPatronId": this.selectedPatronData.data.IntPatronId,
    }
    this.sharedService.loading.next(true);
    this.dataService.getPatronFees(reqObj)
      .subscribe(
        (response: any) => {
          const userPatronFees = response.body;
          const modifiedIndividualAssigedFeesArray = [];
          this.assignedFeesCount = false;
          if(userPatronFees.PatronFees.length > 0){ this.assignedFeesCount = true; } else { this.assignedFeesCount = false; }
          userPatronFees.PatronFees.forEach((patronFee) => {
            patronFee.name = this.getPatronName(patronFee.IntPatronId);
            patronFee.isPatronActive = this.getPatronStatus(patronFee.IntPatronId);
            patronFee.modifiedFeeType = 'Assigned Fee';
            patronFee.IntSiteId = userPatronFees.IntSiteId;
            patronFee.Attribute=patronFee.Attribute ? patronFee.Attribute: null;
            patronFee.selectedAttributeValue=patronFee.IntFeeAttributeId;
            patronFee.CustomFields=patronFee.CustomFields && patronFee.CustomFields.length > 0 ? patronFee.CustomFields: null,
            modifiedIndividualAssigedFeesArray.push(patronFee);
          })
          this.mergeCartAndIndividualAssignedFees(this.assignedFeesCartItems, modifiedIndividualAssigedFeesArray);
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** get all students optional fees */
  getAllOptionalFees() {
    const datePipe = new DatePipe('en-US');
    this.sharedService.loading.next(true);
    this.dataService.getOptionalUserPatronFees()
      .subscribe(
        (response: any) => {
          const userPatrons = response.body.Patrons;
          const modifiedAllOptionalFeesArray = [];
          let categories = [];
          let category_item = 7;
          userPatrons.forEach((patronData) => {
            patronData.OptionalFees.forEach((optionalFee) => { 
              if (
                this.optionalFeesCount == false &&
                patronData.OptionalFees.length > 0
              ) {
                this.optionalFeesCount = true;
                console.log("optional fee")
              }
              const obj = {
                "IntSiteId": patronData.IntSiteId,
                "SiteId": patronData.SiteId,
                "IntPatronId": patronData.IntPatronId,
                "isPatronActive": this.getPatronStatus(patronData.IntPatronId),
                "PatronId": patronData.PatronId,
                "FirstName": patronData.FirstName,
                "LastName": patronData.LastName,
                "IntUserId": patronData.IntUserId,
                "IntFeeId": optionalFee.IntFeeId,
                "FeeCode": optionalFee.FeeCode,
                "FeeName": optionalFee.FeeName,
                "FeeDescription": optionalFee.FeeDescription,
                "FeeClass": optionalFee.FeeClass,
                "modifiedFeeType": 'Optional Fee',
                "name": this.getPatronName(patronData.IntPatronId),
                "FeeType": optionalFee.FeeType,
                "FeeCategory": optionalFee.FeeCategory,
                "StartDate": optionalFee.StartDate,
                "EndDate": optionalFee.EndDate,
                "DueDate": datePipe.transform(optionalFee.DueDate, 'MM/dd/yyyy'),
                "AmountDue": optionalFee.AmountDue,
                "IntSchoolId": optionalFee.IntSchoolId,
                "School": optionalFee.School,
                "Installments": optionalFee.Installments,
                "AllowPartial": optionalFee.AllowPartial,
                "ScheduledDay": optionalFee.ScheduledDay,
                "LimitedSpotsAvailable": optionalFee.LimitedSpotsAvailable,
                "VariablePricedSw": optionalFee.VariablePricedSw,
                "RemainInListSw": optionalFee.RemainInListSw,
                "ScheduledAmount": 0,
                "IsValidEndDate": true,
                "SessionCategory": optionalFee.Session && optionalFee.Session.CategoryName ? optionalFee.Session.CategoryName : null,
                "Attribute": optionalFee.Attribute ? optionalFee.Attribute:null,
                "CustomFields":optionalFee.CustomFields && optionalFee.CustomFields.length > 0 ? optionalFee.CustomFields: null,
                "attributeSelected":false,
                "clikedOnCard":false,
                "disabledAttribute":'',
                "TempAmtDue":optionalFee.AmountDue,
                "selectedAttributeValue":null,
                "Session": optionalFee.Session ? optionalFee.Session : null,
                "ShowDisclosureOptIn": optionalFee.ShowDisclosureOptIn,
                "IntDisclosureCategoryID":optionalFee.IntDisclosureCategoryID
              }
              if(obj.Attribute)
              {
                obj.Attribute.Options.sort((a, b) => a.Amount - b.Amount);
                var lowest = Number.POSITIVE_INFINITY;
                var tmp;
                for (var i=obj.Attribute.Options.length-1; i>=0; i--) {
                    tmp = obj.Attribute.Options[i].Amount;
                    if (tmp < lowest) lowest = tmp;
                }
                obj.AmountDue=lowest;

              }
            
              if(optionalFee.Session && optionalFee.Session.CategoryName) {
                 const sessionCategory = {
                  "IntPatronId": patronData.IntPatronId,
                  "value": category_item,
                  "SessionCategory": optionalFee.Session.CategoryName,
                }
                category_item++;
                categories.length === 0 ? categories.push(sessionCategory) : null;
                const index = categories.findIndex(x => x.SessionCategory == sessionCategory.SessionCategory);
                if(index === -1) {
                        categories.push(sessionCategory);
                }
              }
              modifiedAllOptionalFeesArray.push(obj);
            })
          })
          this.mergeCartAndAllOptionalFees(this.optionalFeesCartItems, modifiedAllOptionalFeesArray);
          categories = categories.sort((a, b) => a.SessionCategory.localeCompare(b.SessionCategory));
          this.SessionCategories = categories;
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** get individual student optional fees */
  getIndividualOptionalFees() {
    const datePipe = new DatePipe('en-US');
    const reqObj = {
      "IntSiteId": this.selectedPatronData.data.IntSiteId,
      "IntPatronId": this.selectedPatronData.data.IntPatronId,
    }    
    this.optionalFeesCount = false;
    this.sharedService.loading.next(true);
    this.dataService.getOptionalPatronFees(reqObj)
      .subscribe(
        (response: any) => {
          const patronData = response.body;
          const modifiedIndividualOptionalFeesArray = [];
          let categories = [];
          let category_item = 7;
          if (patronData.OptionalFees.length > 0) {
            this.optionalFeesCount = true;
          } else { this.optionalFeesCount = false; }
          patronData.OptionalFees.forEach((optionalFee) => {
            const obj = {
              "IntSiteId": patronData.IntSiteId,
              "SiteId": patronData.SiteId,
              "IntPatronId": patronData.IntPatronId,
              "isPatronActive": this.getPatronStatus(patronData.IntPatronId),
              "PatronId": patronData.PatronId,
              "FirstName": patronData.FirstName,
              "LastName": patronData.LastName,
              "IntUserId": patronData.IntUserId,
              "IntFeeId": optionalFee.IntFeeId,
              "FeeCode": optionalFee.FeeCode,
              "FeeName": optionalFee.FeeName,
              "FeeDescription": optionalFee.FeeDescription,
              "FeeClass": optionalFee.FeeClass,
              "modifiedFeeType": 'Optional Fee',
              "name": this.getPatronName(patronData.IntPatronId),
              "FeeType": optionalFee.FeeType,
              "FeeCategory": optionalFee.FeeCategory,
              "StartDate": optionalFee.StartDate,
              "EndDate": optionalFee.EndDate,
              "DueDate": datePipe.transform(optionalFee.DueDate, 'MM/dd/yyyy'),
              "AmountDue": optionalFee.AmountDue,
              "IntSchoolId": optionalFee.IntSchoolId,
              "School": optionalFee.School,
              "Installments": optionalFee.Installments,
              "AllowPartial": optionalFee.AllowPartial,
              "ScheduledDay": optionalFee.ScheduledDay,
              "LimitedSpotsAvailable": optionalFee.LimitedSpotsAvailable,
              "VariablePricedSw": optionalFee.VariablePricedSw,
              "RemainInListSw": optionalFee.RemainInListSw,
              "ScheduledAmount": 0,
              "IsValidEndDate": true,
              "SessionCategory": optionalFee.Session && optionalFee.Session.CategoryName ? optionalFee.Session.CategoryName : null,
              "Attribute": optionalFee.Attribute ? optionalFee.Attribute:null,
              "CustomFields":optionalFee.CustomFields && optionalFee.CustomFields.length > 0 ? optionalFee.CustomFields: null,
              "attributeSelected":false,
              "clikedOnCard":false,
              "disabledAttribute":'',
              "TempAmtDue":optionalFee.AmountDue,
              "selectedAttributeValue":null,
              "Session": optionalFee.Session ? optionalFee.Session : null,
              "ShowDisclosureOptIn": optionalFee.ShowDisclosureOptIn,
              "IntDisclosureCategoryID":optionalFee.IntDisclosureCategoryID
            }

            if(obj.Attribute)
            {
              var lowest = Number.POSITIVE_INFINITY;
              var highest = Number.NEGATIVE_INFINITY;
              var tmp;
              for (var i=obj.Attribute.Options.length-1; i>=0; i--) {
                  tmp = obj.Attribute.Options[i].Amount;
                  if (tmp < lowest) lowest = tmp;
              }
              obj.AmountDue=lowest;
              // console.log('lowest', lowest);

            }
            if(optionalFee.Session && optionalFee.Session.CategoryName) {
               const sessionCategory = {
                "IntPatronId": patronData.IntPatronId,
                "value": category_item,
                "SessionCategory": optionalFee.Session.CategoryName,
              }
              category_item++;
              categories.length === 0 ? categories.push(sessionCategory) : null;
              const index = categories.findIndex(x => x.SessionCategory == sessionCategory.SessionCategory);
              if(index === -1) {
                      categories.push(sessionCategory);
              }
            }
            modifiedIndividualOptionalFeesArray.push(obj);
          })
          this.mergeCartAndIndividualOptionalFees(this.optionalFeesCartItems, modifiedIndividualOptionalFeesArray);
          categories = categories.sort((a, b) => a.SessionCategory.localeCompare(b.SessionCategory));
          this.SessionCategories = categories;
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  mergeCartAndAllAssignedFees(assignedCartItems, allAssignedFees) {
    allAssignedFees.forEach((assignedFee) => {
      
      let amountToDisplay:any;
      if(assignedFee.ScheduledAmount){
        amountToDisplay = assignedFee.NetAmount - assignedFee.ScheduledAmount;
      }else{
        amountToDisplay = assignedFee.NetAmount
      }

      assignedCartItems.forEach((assignedCartItem) => {
        if (assignedCartItem.IntFeePatronId == assignedFee.IntFeePatronId && assignedCartItem.IntPatronId == assignedFee.IntPatronId) {
          assignedFee.CartAmount = assignedCartItem.CartAmount;
          assignedFee.IntPatronCartId = assignedCartItem.IntPatronCartId;
        }
      });
      assignedFee.AmountDue = amountToDisplay;
    })

    this.allAssignedFees = allAssignedFees;
    this.fees = allAssignedFees;
    console.log("allAssignedFees",this.fees);
    this.getAllOptionalFees();
  }


  mergeCartAndAllOptionalFees(optionalCartItems, allOptionalFees) {
    
    allOptionalFees.forEach((allOptionalFee) => {
      optionalCartItems.forEach((optionalCartItem) => {
        if (allOptionalFee.IntFeeId == optionalCartItem.IntFeeId && allOptionalFee.IntPatronId == optionalCartItem.IntPatronId) {
          allOptionalFee.CartAmount = optionalCartItem.CartAmount;
          allOptionalFee.AmountPaid = optionalCartItem.AmountPaid;
          allOptionalFee.IntPatronCartId = optionalCartItem.IntPatronCartId;
          // allOptionalFee.CustomFields = optionalCartItem.CustomFields;
          allOptionalFee.selectedAttributeValue=optionalCartItem.selectedAttributeValue
          if(allOptionalFee.CustomFields){
            allOptionalFee.CustomFields.forEach((customField)=>{
              optionalCartItem.CustomFields.forEach(element => {
                if(element.IntFeeCustomFieldId == customField.IntFeeCustomFieldId){
                  customField.UserValue = element.UserValue;
                  customField.Options = element.Options;
                }
              });
            })
          }
          if(optionalCartItem.selectedAttributeValue && allOptionalFee.Attribute){
            allOptionalFee.Attribute.Options.forEach((option)=>{
              if(option.IntFeeAttributeId == optionalCartItem.selectedAttributeValue){
                allOptionalFee.AmountDue= option.Amount;
              }
            }) 
          }
          if(optionalCartItem.FeeName == 'test_iphone'){
            // console.log(allOptionalFee);
            // console.log(optionalCartItem);
          }
        }
        
      })
    });
    this.allOptionalFees = allOptionalFees;
    this.fees = this.allAssignedFees.concat(allOptionalFees);

    console.log("ALLoptionalFee",this.fees);
    this.onSelectedTypeChange();
  }

  mergeCartAndIndividualAssignedFees(assignedCartItems, individualAssignedFees) {
    individualAssignedFees.forEach((assignedFee) => {
      assignedCartItems.forEach((assignedCartItem) => {
        if (assignedCartItem.IntFeePatronId == assignedFee.IntFeePatronId && assignedCartItem.IntPatronId == assignedFee.IntPatronId) {
          assignedFee.CartAmount = assignedCartItem.CartAmount;
          assignedFee.IntPatronCartId = assignedCartItem.IntPatronCartId;
        }
      })
    })
    this.individualAssignedFees = individualAssignedFees;
    this.fees = individualAssignedFees;
    console.log("IndividualAssigned",this.fees);
    this.getIndividualOptionalFees();
  }

  mergeCartAndIndividualOptionalFees(optionalCartItems, individualOptionalFees) {
    individualOptionalFees.forEach((individualOptionalFee) => {
      optionalCartItems.forEach((optionalCartItem) => {
        if (individualOptionalFee.IntFeeId == optionalCartItem.IntFeeId && individualOptionalFee.IntPatronId == optionalCartItem.IntPatronId) {
          individualOptionalFee.CartAmount = optionalCartItem.CartAmount;
          individualOptionalFee.AmountPaid = optionalCartItem.AmountPaid;
          individualOptionalFee.IntPatronCartId = optionalCartItem.IntPatronCartId;
         individualOptionalFee.AmountDue= individualOptionalFee.TempAmtDue;
          // individualOptionalFee.AmountDue= optionalCartItem.CartAmount;
          individualOptionalFee.selectedAttributeValue=optionalCartItem.selectedAttributeValue
        }
      })
    });
    this.individualOptionalFees = individualOptionalFees;
    this.fees = this.individualAssignedFees.concat(individualOptionalFees);
    console.log("IndividualOptional",this.fees);
    this.onSelectedTypeChange();
  }

  /*Schedule Fee API*/
  getPaymentMethods() {
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          response = response.body;
          this.defaultValue = [];
          this.nonDefaultValue = [];

          if (response.PaymentMethods.length > 0) {
            for (let i = 0; i < response.PaymentMethods.length; i++) {
              if (response.PaymentMethods[i].Default == true) {
                this.defaultValue.push(response.PaymentMethods[i]);
                this.selectedPaymentMethodId = response.PaymentMethods[i].PaymentMethodId
                this.PaymentType = response.PaymentMethods[i].PaymentType
                this.PreAuthAccount = response.PaymentMethods[i].AccountNumber
                this.PaymentMethodId = response.PaymentMethods[i].PaymentMethodId
              } else {
                this.nonDefaultValue.push(response.PaymentMethods[i]);
              }
            }

            this.ViewPayments = [];

            this.ViewPayments = this.defaultValue.concat(this.nonDefaultValue);

          }
          this.getFeesForScheduledPayments();

        },
        (error) => {
          console.log(error)
        }
      )
  }

  getFeesForScheduledPayments() {
    this.scheduledFeesCount = false;
    let scheduledPaymentsInstallmentsDetails = new ScheduledPaymentsInstallmentsDetails();
    this.FeesForScheduledPayments = [];
    this.dataService.getFeesForScheduledPayments()
      .subscribe(
        (response: any) => {
          response = response.body;
          if (response.Patrons.length > 0) {
            for (let m = 0; m < response.Patrons.length; m++) {
              if (response.Patrons[m].Fees.length > 0) {
                for (let i = 0; i < response.Patrons[m].Fees.length; i++) {                  
                  scheduledPaymentsInstallmentsDetails = new ScheduledPaymentsInstallmentsDetails();
                  scheduledPaymentsInstallmentsDetails.IntFeeId = response.Patrons[m].Fees[i].IntFeeId
                  scheduledPaymentsInstallmentsDetails.IntFeePatronId = response.Patrons[m].Fees[i].IntFeePatronId
                  scheduledPaymentsInstallmentsDetails.IntPatronId = response.Patrons[m].Fees[i].IntPatronId
                  scheduledPaymentsInstallmentsDetails.IntUserId = response.Patrons[m].Fees[i].IntUserId
                  scheduledPaymentsInstallmentsDetails.FeeName = response.Patrons[m].Fees[i].FeeName
                  scheduledPaymentsInstallmentsDetails.FeeCode = response.Patrons[m].Fees[i].FeeCode
                  scheduledPaymentsInstallmentsDetails.FeeDescription = response.Patrons[m].Fees[i].FeeDescription
                  scheduledPaymentsInstallmentsDetails.FeeClass = response.Patrons[m].Fees[i].FeeClass
                  scheduledPaymentsInstallmentsDetails.FeeType = response.Patrons[m].Fees[i].FeeType
                  scheduledPaymentsInstallmentsDetails.AmountDue = response.Patrons[m].Fees[i].AmountDue
                  scheduledPaymentsInstallmentsDetails.AmountPaid = response.Patrons[m].Fees[i].AmountPaid
                  scheduledPaymentsInstallmentsDetails.NetAmount = response.Patrons[m].Fees[i].NetAmount
                  scheduledPaymentsInstallmentsDetails.Paid = response.Patrons[m].Fees[i].Paid
                  scheduledPaymentsInstallmentsDetails.AssignedDate = response.Patrons[m].Fees[i].AssignedDate
                  scheduledPaymentsInstallmentsDetails.StartDate = response.Patrons[m].Fees[i].StartDate
                  scheduledPaymentsInstallmentsDetails.DueDate = response.Patrons[m].Fees[i].DueDate
                  scheduledPaymentsInstallmentsDetails.SchoolName = response.Patrons[m].Fees[i].SchoolName
                  scheduledPaymentsInstallmentsDetails.DistrictName = response.Patrons[m].Fees[i].DistrictName
                  scheduledPaymentsInstallmentsDetails.Assigned = response.Patrons[m].Fees[i].Assigned
                  scheduledPaymentsInstallmentsDetails.Optional = response.Patrons[m].Fees[i].Optional
                  scheduledPaymentsInstallmentsDetails.ScheduleDay = response.Patrons[m].Fees[i].ScheduleDay
                  scheduledPaymentsInstallmentsDetails.Installments = response.Patrons[m].Fees[i].Installments
                  scheduledPaymentsInstallmentsDetails.InstallmentsLeft = response.Patrons[m].Fees[i].InstallmentsLeft
                  scheduledPaymentsInstallmentsDetails.AllowPartial = response.Patrons[m].Fees[i].AllowPartial
                  scheduledPaymentsInstallmentsDetails.PendingTransactionAmount = response.Patrons[m].Fees[i].PendingTransactionAmount
                  scheduledPaymentsInstallmentsDetails.Scheduled = response.Patrons[m].Fees[i].Scheduled
                  if(scheduledPaymentsInstallmentsDetails.Scheduled){
                    this.scheduledFeesCount = true;
                    console.log("scheduled fees")
                  }
                  scheduledPaymentsInstallmentsDetails.ScheduledAmount = response.Patrons[m].Fees[i].ScheduledAmount
                  scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule = response.Patrons[m].Fees[i].InstallmentsLeftToSchedule

                  scheduledPaymentsInstallmentsDetails.ScheduledDate = ""
                  scheduledPaymentsInstallmentsDetails.PaymentMethod = ""
                  scheduledPaymentsInstallmentsDetails.Active = ""
                  scheduledPaymentsInstallmentsDetails.Processed = ""
                  scheduledPaymentsInstallmentsDetails.AccountLast4 = ""
                  scheduledPaymentsInstallmentsDetails.CartAmount = 0
                  this.FeesForScheduledPayments.push(scheduledPaymentsInstallmentsDetails);

                }
              }

            }

          }
          this.getScheduledPaymentMethod(this.FeesForScheduledPayments)

        },
        (error) => {

          console.log(error);
        }
      )
  }


  getScheduledPaymentMethod(FeesForScheduledPayments) {
    this.ScheduledPaymentMethod = [];
    let scheduledPaymentsInstallmentsDetails = new ScheduledPaymentsInstallmentsDetails();

    this.dataService.getScheduledPaymentMethod()
      .subscribe(
        (response: any) => {
          response = response.body;
          if (response.ScheduledPayments.length > 0) {
           
            for (let i = 0; i < response.ScheduledPayments.length; i++) {
              scheduledPaymentsInstallmentsDetails = new ScheduledPaymentsInstallmentsDetails();
              scheduledPaymentsInstallmentsDetails.IntScheduledPaymentId = response.ScheduledPayments[i].IntScheduledPaymentId
              scheduledPaymentsInstallmentsDetails.IntSiteId = response.ScheduledPayments[i].IntSiteId
              scheduledPaymentsInstallmentsDetails.IntPatronId = response.ScheduledPayments[i].IntPatronid
              scheduledPaymentsInstallmentsDetails.IntFeePatronId = response.ScheduledPayments[i].IntFeePatronId
              scheduledPaymentsInstallmentsDetails.FeeName = response.ScheduledPayments[i].FeeName
              scheduledPaymentsInstallmentsDetails.FeeClass = response.ScheduledPayments[i].FeeClass
              scheduledPaymentsInstallmentsDetails.ActiveSw = response.ScheduledPayments[i].ActiveSw
              scheduledPaymentsInstallmentsDetails.PaymentNumber = response.ScheduledPayments[i].PaymentNumber
              scheduledPaymentsInstallmentsDetails.PaymentMethod = response.ScheduledPayments[i].PaymentMethod
              scheduledPaymentsInstallmentsDetails.PaymentAmount = response.ScheduledPayments[i].PaymentAmount
              scheduledPaymentsInstallmentsDetails.PaymentDate = response.ScheduledPayments[i].PaymentDate
              scheduledPaymentsInstallmentsDetails.PreAuthToken = response.ScheduledPayments[i].PreAuthToken
              scheduledPaymentsInstallmentsDetails.PreAuthAccount = response.ScheduledPayments[i].PreAuthAccount
              scheduledPaymentsInstallmentsDetails.ProcessedSw = response.ScheduledPayments[i].ProcessedSw
              scheduledPaymentsInstallmentsDetails.TotalProcessingFee = Number(response.ScheduledPayments[i].ProcessingFee.TotalProcessingFee).toFixed(2);
              scheduledPaymentsInstallmentsDetails.PreAuthType = response.ScheduledPayments[i].PreAuthType
              if (scheduledPaymentsInstallmentsDetails.PreAuthType == 'CC') {
                scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'ICF_1'
                scheduledPaymentsInstallmentsDetails.showPerTransaction = false;
              } else if (scheduledPaymentsInstallmentsDetails.PreAuthType == 'ACH') {
                scheduledPaymentsInstallmentsDetails.PaymentTypeMsg = 'Schedule_Transaction_Fee'
                scheduledPaymentsInstallmentsDetails.showPerTransaction = true;
              }
              if (FeesForScheduledPayments && FeesForScheduledPayments.length > 0 && FeesForScheduledPayments != undefined) {
                for (let j = 0; j < FeesForScheduledPayments.length; j++) {
                  if (FeesForScheduledPayments[j].IntPatronId === response.ScheduledPayments[i].IntPatronid && FeesForScheduledPayments[j].IntFeePatronId === response.ScheduledPayments[i].IntFeePatronId) {
                    this.ScheduledPayments = true;
                    scheduledPaymentsInstallmentsDetails.IntFeeId = FeesForScheduledPayments[j].IntFeeId
                    scheduledPaymentsInstallmentsDetails.IntFeePatronId = FeesForScheduledPayments[j].IntFeePatronId
                    scheduledPaymentsInstallmentsDetails.IntPatronId = FeesForScheduledPayments[j].IntPatronId
                    scheduledPaymentsInstallmentsDetails.IntUserId = FeesForScheduledPayments[j].IntUserId
                    scheduledPaymentsInstallmentsDetails.FeeName = FeesForScheduledPayments[j].FeeName
                    scheduledPaymentsInstallmentsDetails.FeeCode = FeesForScheduledPayments[j].FeeCode
                    scheduledPaymentsInstallmentsDetails.FeeDescription = FeesForScheduledPayments[j].FeeDescription
                    scheduledPaymentsInstallmentsDetails.FeeClass = FeesForScheduledPayments[j].FeeClass
                    scheduledPaymentsInstallmentsDetails.FeeType = FeesForScheduledPayments[j].FeeType
                    scheduledPaymentsInstallmentsDetails.AmountDue = FeesForScheduledPayments[j].AmountDue
                    scheduledPaymentsInstallmentsDetails.AmountPaid = FeesForScheduledPayments[j].AmountPaid
                    scheduledPaymentsInstallmentsDetails.NetAmount = FeesForScheduledPayments[j].NetAmount
                    scheduledPaymentsInstallmentsDetails.Paid = FeesForScheduledPayments[j].Paid
                    scheduledPaymentsInstallmentsDetails.AssignedDate = FeesForScheduledPayments[j].AssignedDate
                    scheduledPaymentsInstallmentsDetails.StartDate = FeesForScheduledPayments[j].StartDate
                    scheduledPaymentsInstallmentsDetails.DueDate = FeesForScheduledPayments[j].DueDate
                    scheduledPaymentsInstallmentsDetails.SchoolName = FeesForScheduledPayments[j].SchoolName
                    scheduledPaymentsInstallmentsDetails.DistrictName = FeesForScheduledPayments[j].DistrictName
                    scheduledPaymentsInstallmentsDetails.Assigned = FeesForScheduledPayments[j].Assigned
                    scheduledPaymentsInstallmentsDetails.Optional = FeesForScheduledPayments[j].Optional
                    scheduledPaymentsInstallmentsDetails.ScheduleDay = FeesForScheduledPayments[j].ScheduleDay
                    scheduledPaymentsInstallmentsDetails.Installments = FeesForScheduledPayments[j].Installments
                    scheduledPaymentsInstallmentsDetails.InstallmentsLeft = FeesForScheduledPayments[j].InstallmentsLeft
                    scheduledPaymentsInstallmentsDetails.AllowPartial = FeesForScheduledPayments[j].AllowPartial
                    scheduledPaymentsInstallmentsDetails.PendingTransactionAmount = FeesForScheduledPayments[j].PendingTransactionAmount
                    scheduledPaymentsInstallmentsDetails.Scheduled = FeesForScheduledPayments[j].Scheduled
                    scheduledPaymentsInstallmentsDetails.ScheduledAmount = FeesForScheduledPayments[j].ScheduledAmount
                    scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule = FeesForScheduledPayments[j].InstallmentsLeftToSchedule

                    scheduledPaymentsInstallmentsDetails.ScheduledDate = FeesForScheduledPayments[j].ScheduledDate
                    // scheduledPaymentsInstallmentsDetails.PaymentMethod = FeesForScheduledPayments[j].ScheduledDate
                    scheduledPaymentsInstallmentsDetails.Active = FeesForScheduledPayments[j].ScheduledDate
                    scheduledPaymentsInstallmentsDetails.Processed = FeesForScheduledPayments[j].ScheduledDate
                    scheduledPaymentsInstallmentsDetails.AccountLast4 = FeesForScheduledPayments[j].ScheduledDate


                    // this.InstallmentsLeftToSchedule = FeesForScheduledPayments[j].InstallmentsLeftToSchedule
                    scheduledPaymentsInstallmentsDetails.CartAmount = FeesForScheduledPayments[j].CartAmount

                  }

                }
              }
              // let item = this.ScheduledPaymentMethod.find((item) => 
              // item.IntPatronId == scheduledPaymentsInstallmentsDetails.IntPatronId && item.InstallmentsLeftToSchedule == scheduledPaymentsInstallmentsDetails.InstallmentsLeftToSchedule)
              // if(!item) {
              //     this.ScheduledPaymentMethod.push(scheduledPaymentsInstallmentsDetails);
              //   }


              // console.log('getScheduledPaymentMethod',this.ScheduledPaymentMethod)
              this.ScheduledPaymentMethod.push(scheduledPaymentsInstallmentsDetails);
              console.log('Fees Schedule details',this.ScheduledPaymentMethod);

            }

          }
        },
        (error) => {

          console.log(error);
        }
      )
  }


  onSelectedPaymentType(AccountNumber) {
    this.paymentcheckoutresponse = this.ViewPayments.filter(s => s.AccountNumber === AccountNumber);
    this.PaymentType = this.paymentcheckoutresponse[0].PaymentType;
    this.PaymentMethodId = this.paymentcheckoutresponse[0].PaymentMethodId;
  }

  filterFees(data, type) {
    if (type == 'searchbar') {
      this.onSelectedTypeChange();
    }
    if (data) {
      const fees = this.fees;
      this.fees = fees.filter(function (fee) {
        return (fee.FeeDescription.toLowerCase().indexOf(data.toLowerCase()) >= 0 || fee.FeeName.toLowerCase().indexOf(data.toLowerCase()) >= 0);
      });
    }
  }

  public sortByTransactionDate(array) {
    return array.sort((a, b) => {
      return a.TransactionDate - b.TransactionDate;
    });
  }

  sortByKey(array, key) {
    return array.sort(function (a, b) {
      let x = a[key]; let y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 0 : 1));
    });
  }
  filterPaidFees(data) {

    this.ModifiedPaidFeesArray = this.fullDataArray;

    if (data) {
      const ModifiedPaidFeesArray = this.ModifiedPaidFeesArray;
      this.paidFees = true;
      this.ModifiedPaidFeesArray = ModifiedPaidFeesArray.filter(function (paidFees) {
        return (paidFees.FeeDescription.toLowerCase().indexOf(data.toLowerCase()) >= 0 || paidFees.FeeName.toLowerCase().indexOf(data.toLowerCase()) >= 0);
      });
    }
  }

  saveFeePayments(feeData, customFields=null) {
    let obj;
    this.sharedService.loading.next(true);
    if (feeData.modifiedFeeType == 'Assigned Fee') {
      obj = {
        "IntSiteId": feeData.IntSiteId,
        "IntPatronId": feeData.IntPatronId,
        "IntUserId": feeData.IntUserId,
        "IntFeePatronId": feeData.IntFeePatronId,
        "Active": true,
        "Amount": this.amount,
        "IntPatronCartId": feeData.IntPatronCartId ? feeData.IntPatronCartId : 0,
        "IntFeeAdvanceAttributeId":feeData.selectedAttributeValue,
        "CustomFields": (feeData.CustomFields ? feeData.CustomFields : [])

      }
      if (customFields != null) {
        obj.CustomFields = customFields;
      }
      this.saveAssignedFeePayment(obj);
    } else if (feeData.modifiedFeeType == 'Optional Fee') {
      obj = {
        "IntSiteId": feeData.IntSiteId,
        "IntPatronId": feeData.IntPatronId,
        "IntUserId": feeData.IntUserId,
        "IntFeeId": feeData.IntFeeId,
        "Active": true,
        "Amount": this.amount,
        "IntPatronCartId": feeData.IntPatronCartId ? feeData.IntPatronCartId : 0,
        "IntFeeAdvanceAttributeId":feeData.selectedAttributeValue,
        "CustomFields": (feeData.CustomFields ? feeData.CustomFields : [])
      }

      if (customFields != null) {
        obj.CustomFields = customFields;
      }

      this.saveOptionalFeePayment(obj);
    }
  }

  saveAssignedFeePayment(obj) {
    this.dataService.saveAssignedFeePayment(obj).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.getCartItems();
        } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
          const message = this.translate.instant('contact_support');
          this.alertService.failureToast(message);
        } else {
          const message = this.translate.instant('error_due_to');
          this.alertService.checkPEProcessingMessages(response.body, message);
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
      })
  }

  saveOptionalFeePayment(obj) {
    this.dataService.saveOptionalFeePayment(obj).subscribe(
      (response: any) => {
        this.sharedService.loading.next(false);
        if (response.body.APIStatus == 'Success' && response.status == 200) {
          this.getCartItems();
        } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
          const message = this.translate.instant('contact_support');
          this.alertService.failureToast(message);
        } else {
          const message = this.translate.instant('error_due_to');
          this.alertService.checkPEProcessingMessages(response.body, message);
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
      })
  }

  checkDisclosure(feeData, type){

    // let shareMenu = this.patrons.filter(item=> {
    //   if(item.IntPatronId == feeData.IntPatronId){
    //     return item;
    //   }
    // })
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    // if(!feeData.ShowDisclosureOptIn){
    if (feeData.ShowDisclosureOptIn && !this.districtFeaturelist.ForceAssignedFee) {
      if (!feeData.Attribute || feeData.CartAmount || feeData.modifiedFeeType !== 'Optional Fee') {
      this.disclosureAlert(feeData, type);
      } else {
        feeData.clikedOnCard = true;
      }
    }else{
      this.checkForForceAssignedFee(feeData, type)
    }
  }

  disclosureAlert(feeData, type){
    let  checkedDisclosure:boolean;
    const alert = this.alertController.create({
      header: this.translate.instant('DISCLOSURE_HEADING'),
      message:  this.translate.instant('DISCLOSURE_CONTENT'),
      
      inputs: [
        {
          type:'checkbox',
          label:this.translate.instant('DO_NOT_SHOW_POP_UP'),
          handler:(val)=>{
            checkedDisclosure = val.checked;
          }
        }
      ],
      buttons: [
        {
          text: this.translate.instant('SHARE_MEAL_BENEFIT'),
          cssClass: 'secondary sm-font',
          handler: () => {
            if(checkedDisclosure){
              let payload = {
                "NotificationType": "Disclosure",
                "IntSiteId": feeData.IntSiteId,
                "IntFeeId":feeData.IntFeeId,
                "IntDisclosureCategoryID":feeData.IntDisclosureCategoryID
              }
              this.OnClearQuikappsNotification(payload)
              let url;
              const globals = JSON.parse(sessionStorage.getItem('globals'));
              url = this.quikappsBaseUrl + '/#/Mobiletoquickappslogin?mobileDisclosure=11&mobiletoken=' + globals.ApiKey;
              this.sharedService.openUrl(url);
            }else{
              let url;
              const globals = JSON.parse(sessionStorage.getItem('globals'));
              url = this.quikappsBaseUrl + '/#/Mobiletoquickappslogin?mobileDisclosure=11&mobiletoken=' + globals.ApiKey;
              this.sharedService.openUrl(url);
            }
          }
        },{
          text: (type == 'cart')?this.translate.instant('ADD_FEE_TO_CART_WITHOUT_SHARING'):this.translate.instant('SCHEDULE_FEE_WITHOUT_SHARING'),
          cssClass: 'secondary sm-font',
          handler: () => {
            if(checkedDisclosure){
              let payload = {
                "NotificationType": "Disclosure",
                "IntSiteId": feeData.IntSiteId,
                "IntFeeId":feeData.IntFeeId,
                "IntDisclosureCategoryID":feeData.IntDisclosureCategoryID
              }
              this.OnClearQuikappsNotification(payload);
              this.checkForForceAssignedFee(feeData, type);
            }else{
              this.checkForForceAssignedFee(feeData, type);
            }
          }
        }
      ]
    });
  

    alert.then((res) => {
      res.present();
      res.onDidDismiss().then((dismissData) => { 
        if(checkedDisclosure){
          let payload = {
            "NotificationType": "Disclosure",
            "IntSiteId": feeData.IntSiteId,
            "IntFeeId":feeData.IntFeeId,
            "IntDisclosureCategoryID":feeData.IntDisclosureCategoryID
          }
          this.OnClearQuikappsNotification(payload);
          this.getCartItems();
        }
      })
    })
  }

  OnClearQuikappsNotification(reqObj) {
    this.dataService.ClearQuikappsNotification(reqObj)
      .subscribe(
        (response: any) => {
          console.log(response);
        },
        (error) => {
          console.log(error);
        }
      )
  }

  checkForForceAssignedFee(feeData, type) {
    if (!feeData.attributeSelected || !feeData.Attribute || feeData.CartAmount || feeData.modifiedFeeType !== 'Optional Fee') {
      let assignedFeeLength;
      this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
      const selectedPatronData = JSON.parse(localStorage.getItem('selectedPatron'));
      if (selectedPatronData.type == 'all') {
        const fileteredAllAssignedFees = this.allAssignedFees.filter((fee) => {
          if (fee.IntPatronId == feeData.IntPatronId  && ((fee.Scheduled == false) || (fee.Scheduled == true && fee.NetAmount != fee.ScheduledAmount))) {
            return fee;
          }
        });
        assignedFeeLength = fileteredAllAssignedFees.length;
      } else {
         const fileteredAllAssignedFees = this.individualAssignedFees.filter((fee) => {
          if (fee.IntPatronId == feeData.IntPatronId  && ((fee.Scheduled == false) || (fee.Scheduled == true && fee.NetAmount != fee.ScheduledAmount))) {
            return fee;
          }
        });
        assignedFeeLength = fileteredAllAssignedFees.length;
        //assignedFeeLength = this.individualAssignedFees.length;
      }
      if (this.districtFeaturelist.ForceAssignedFee && assignedFeeLength > 0 && feeData.modifiedFeeType != 'Assigned Fee') {
        let message
        if (type == 'cart') {
          message = this.translate.instant('ForceAssignedFeepopup1message');
        } else if (type == 'calender') {
          message = this.translate.instant('ForceAssignedFeepopup2message');
        }
        this.forceAssignedFeeWarningpopup(message, type, feeData);
      } else {
        if (type == 'cart') {
          this.presentAlertConfirm(feeData);
        } else if (type == 'calender') {
          this.onScheduleFees(feeData);
        }
      }
    }
   else{
     feeData.clikedOnCard=true
   }
  }
  
  forceAssignedFeeWarningpopup(message, type, feeData) {
    const alert = this.alertController.create({
      header: this.translate.instant('ForceAssignedFeepopupheader'),
      message: message,
      buttons: [
        // {
        //   text: this.translate.instant('Ignore'),
        //   cssClass: 'secondary',
        //   handler: () => {
        //     if (type == 'cart') {
        //       this.presentAlertConfirm(feeData);
        //     } else if (type == 'calender') {
        //       this.onScheduleFees(feeData);
        //     }
        //   }
        // }, 
        {
          text: this.translate.instant('ok'),
          handler: () => {
            console.log('clicked continue so remain on same page');
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
   }
   selectRadioOption(option,fee) {
    if (option) {
      fee.AmountDue = option.Amount;
      fee.attributeSelected = true;
      fee.disabledAttribute = option;
      fee.selectedAttributeValue = option.IntFeeAttributeId;
      console.log(option)
     }
   }
   
  sortFees() {
    const sortOption = this.selectedSorting;
    if(this.selectedFeeType === "6"){
      const paidFees = this.ModifiedPaidFeesArray;
      if(sortOption === 'Fee Name') {
        const sortedFees = paidFees.sort((a,b) => {
         return (a.FeeName < b.FeeName) ? -1 : (a.FeeName > b.FeeName) ? 1 : 0;
        });
      } else if(sortOption === 'Paid Date') {
        const sortedFees = paidFees.sort((a,b) => {
          if((a.TransactionDate !== '' &&  b.TransactionDate !== '' ) || (a.TransactionDate !== null &&  b.TransactionDate !== null )) {
            return (a.TransactionDate < b.TransactionDate) ? -1 : (a.TransactionDate > b.TransactionDate) ? 1 : 0;
          }else{
            return null;
          }
        });
      }
      // this.ModifiedPaidFeesArray = sortedFees
    }
    else{

      this.fees.forEach((fee:any) => {
        if(fee.modifiedFeeType == 'Assigned Fee'){
          fee.Am
        }
      });
      const groupedFees = this.fees;
      if(sortOption === 'Fee Name') {
        const sortedFees = groupedFees.sort((a,b) => {
      return (a.FeeName < b.FeeName) ? -1 : (a.FeeName > b.FeeName) ? 1 : 0;
        });
      } else if(sortOption === 'Amount Due') {
        const sortedFees = groupedFees.sort((a,b) => {
          return (a.AmountDue < b.AmountDue) ? 1 : (a.AmountDue > b.AmountDue) ? -1 : 0;
        });

      } else if(sortOption === 'End Date') {
        const sortedFees = groupedFees.sort((a,b) => {
          if((a.EndDate !== '' &&  b.EndDate !== '' ) || (a.EndDate !== null &&  b.EndDate !== null )) {
            return (a.EndDate < b.EndDate) ? -1 : (a.EndDate > b.EndDate) ? 1 : 0;
          }else{
            return null;
          }
        });
      }
    }

  }

}

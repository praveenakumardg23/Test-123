import { LanguageService } from './../services/language/language.service';
import { Router } from '@angular/router';
import { DataService } from './../services/data/data.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SharedService } from '../services/shared/shared.service';
import { PaymentHistory, Payments } from '../services/data/model/paymenthistory';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../services/alert/alert.service';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { interval } from 'rxjs';
import { expand, takeWhile, tap } from 'rxjs/operators';
import * as _ from 'lodash';


@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss'],
})
export class PaymentHistoryPage implements OnInit {
  visibleDivIndices: number[] = [];
  transaction_idBoolean = false;
  amountBoolean = false;
  statusBoolean = false;
  dateBoolean = false;
  key = 'date';
  reverse = false;
  public count = 0;
  public itemsPerPage = 1;
  public currentPage = 1;
  selectedMealType = 'All';
  selectedDateType = '30';
  selectedValue: any;
  today;
  paymentSelectedDate;
  paymentSelectedEndDate;
  isEmailMe = false;
  fileName = '';
  maxDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd'); 
  enddate = new Date();
  startdate = new Date();
  selectStartDate;
  selectEndDate;
  paymentStudentDetails;
  paymentHistory = [];
  payments = []; // your other array...
  paymentsListWithoutFilter = []; // your other array...
  patrons = []; // your other array...
  popHeading;
  popupbutton;
  Navigation;
  IsFormValid = true;
  ENDate: any;
  SDate: any;
  isNorecordsfound = false;
  cartCount: number;
  disbleLeftScrollButton = true;
  disbleRightScrollButton = false;
  collapse = false;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  groupedPaymentList: any;
  todayDate=this.datePipe.transform(new Date(), 'yyyy-MM-dd'); 
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef<any>;

  mealTypes = [
    { id: 'All', name: 'all' },
    { id: 'Meal', name: 'meals' },
    { id: 'Preorder', name: 'Preorder' },
    { id: 'AR', name: 'auto_replenishment' },
    { id: 'Fees', name: 'fees' },
    { id: 'Fund', name: 'fund' },
    { id: 'Fundraiser', name: 'Fundraiser' },
    { id: 'Unsuccessful', name: 'unsuccessful' }
  ];

  days = [
    { id: '7', date: '7_days' },
    { id: '30', date: '30_days' },
    { id: '90', date: '90_days' },
    { id: 'Custom Date', date: 'Custom_Date' },
  ];


  constructor(private dataService: DataService,
              private router: Router,
              public languageService: LanguageService,
              private sharedService: SharedService,
              public alertController: AlertController,
              private translate: TranslateService,
              private alertService: AlertService,
              private datePipe: DatePipe) { }

  async onCreateReport(reportType, formData: NgForm) {
    const datePipe = new DatePipe('en-US');
    const alert = await this.alertController.create({
      header: this.translate.instant('report_created'),
      buttons: [
        {
          text: this.translate.instant('send_email'),
          handler: () => {
            this.isEmailMe = true;
            const obj = {
              StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
              EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
              Type: this.selectedMealType,
              ReportType: reportType,
              ReportMethod: 'Email'
            };
            this.getPaymentHistoryReport(obj);
          }
        }
      ]
    });
    await alert.present();
  }


  ngOnInit() {
    this.maxDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    });
    this.todayDate=this.datePipe.transform(new Date(), 'yyyy-MM-dd'); 
  }



  startDateChange(SD, f: NgForm, i) {
    if(SD === undefined){
      this.SDate = this.datePipe.transform(this.selectEndDate, 'MM/dd/yyyy');
      this.selectStartDate = this.selectEndDate;
    }else{
      this.SDate = this.datePipe.transform(SD, 'MM/dd/yyyy');
    }
    
    this.selectStartDate = this.datePipe.transform(this.selectStartDate, 'MM/dd/yyyy');
    this.selectEndDate = this.datePipe.transform(this.selectEndDate, 'MM/dd/yyyy');
    if (new Date(this.SDate) > new Date(this.selectEndDate)) {
      this.IsFormValid = false;
    } else {
      this.IsFormValid = true;
    }
    this.toggleVisibility(i)

  }
  endDateChange(END, f: NgForm, i) {
    this.selectEndDate = this.datePipe.transform(END, 'MM/dd/yyyy');
    this.maxDate = this.datePipe.transform(END, 'yyyy-MM-dd');
    if (new Date(this.SDate) > new Date(this.selectEndDate)) {
      this.IsFormValid = false;
    } else {
      this.IsFormValid = true;
    }
    this.toggleVisibility(i)
  }

  getPaymentHistoryForCustomDates() {
    const onloadrequestdata = {
      StartDate: this.selectStartDate,
      EndDate: this.selectEndDate,
      Type: this.selectedMealType
    };
    this.startdate = this.selectStartDate,
      this.enddate = this.selectEndDate,
      this.getAllPaymentHistory(onloadrequestdata);
  }

  onTypeChange(selectedValue) {
    this.selectedMealType = selectedValue;
    const datePipe = new DatePipe('en-US');
    const onloadrequestdata = {
      StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
      EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
      Type: this.selectedMealType
    };
    this.getAllPaymentHistory(onloadrequestdata);

  }

  onDateChange(selectedDate) {
    if (selectedDate !== 'Custom Date') {
      const datePipe = new DatePipe('en-US');
      this.startdate = new Date();
      this.enddate = new Date();
      this.startdate.setDate(this.startdate.getDate() - selectedDate);
      const onloadrequestdata = {
        StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
        EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
        Type: this.selectedMealType
      };
      this.getAllPaymentHistory(onloadrequestdata);

    } else {
      this.payments = [];
      this.isNorecordsfound = true;
    }
  }

  ionViewWillEnter() {
    this.selectEndDate = new Date().toISOString();
    this.selectedDateType = '30';
    this.selectedMealType = 'All';
    if (this.sharedService.getViewHistoryData() === 'Auto Replenishment') {
      this.selectedMealType = 'AR';
    }
    const datePipe = new DatePipe('en-US');
    this.startdate = new Date();
    this.enddate = new Date();
    this.startdate.setDate(this.startdate.getDate() - 30);
    this.enddate.setDate(this.enddate.getDate());
    const onloadrequestdata = {
      StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
      EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
      Type: this.selectedMealType,
    };
    this.getAllPaymentHistory(onloadrequestdata);
  }


  getAllPaymentHistory(data) {
    this.paymentsListWithoutFilter = [];
    this.payments = [];
    this.patrons = [];
    this.sharedService.loading.next(true);
    let objPayments = new Payments();
    this.dataService.getAllPaymentHistory(data)
      .subscribe(
        (response: any) => {
          this.paymentHistory = response.body.Patrons;

          this.sharedService.loading.next(false);
          if (this.paymentHistory.length > 0) {
            for (let i = 0; i < this.paymentHistory.length; i++) {
              const FirstName = this.paymentHistory[i].FirstName;
              const LastName = this.paymentHistory[i].LastName;
              this.patrons.push(this.paymentHistory[i]);

              if (this.paymentHistory[i].Payments.length > 0) {
                for (let j = 0; j < this.paymentHistory[i].Payments.length; j++) {
                  // this.paymentHistory[i].Payments[j].expanded = false;
                  objPayments = new Payments();
                  objPayments.FirstName = FirstName;
                  objPayments.LastName = LastName;
                  objPayments.Expanded = false;
                  objPayments.PaymentDate = this.paymentHistory[i].Payments[j].PaymentDate;
                  objPayments.IntTransactionId = this.paymentHistory[i].Payments[j].IntTransactionId;
                  objPayments.PaymentType = this.paymentHistory[i].Payments[j].PaymentType ? this.paymentHistory[i].Payments[j].PaymentType : 'NA';
                  objPayments.PaymentMode = this.paymentHistory[i].Payments[j].PaymentMode ? this.paymentHistory[i].Payments[j].PaymentMode : 'NA';
                  if (objPayments.PaymentMode === 'AR') {
                    objPayments.PaymentMode = this.translate.instant('auto_replenishment');
                  }
                  objPayments.BalanceLevel = this.paymentHistory[i].Payments[j].BalanceLevel ? this.paymentHistory[i].Payments[j].BalanceLevel : 'NA';
                  if (objPayments.BalanceLevel == null) {
                    objPayments.BalanceLevel = this.translate.instant('Payment_na');
                  }
                  objPayments.PaymentName = this.paymentHistory[i].Payments[j].PaymentName;
                  // attribute and session
                  objPayments.AttributeValue = this.paymentHistory[i].Payments[j].AttributeValue ? this.paymentHistory[i].Payments[j].AttributeValue : 'NA';
                  objPayments.SessionName = this.paymentHistory[i].Payments[j].SessionName ? this.paymentHistory[i].Payments[j].SessionName : 'NA';
                  objPayments.PeriodStartDateTime = this.paymentHistory[i].Payments[j].PeriodStartDateTime;
                  objPayments.PeriodEndDateTime = this.paymentHistory[i].Payments[j].PeriodEndDateTime;

                  objPayments.SundaySw = this.paymentHistory[i].Payments[j].SundaySw,
                    objPayments.MondaySw = this.paymentHistory[i].Payments[j].MondaySw,
                    objPayments.TuesdaySw = this.paymentHistory[i].Payments[j].TuesdaySw,
                    objPayments.WednesdaySw = this.paymentHistory[i].Payments[j].WednesdaySw,
                    objPayments.ThursdaySw = this.paymentHistory[i].Payments[j].ThursdaySw,
                    objPayments.FridaySw = this.paymentHistory[i].Payments[j].FridaySw,
                    objPayments.SaturdaySw = this.paymentHistory[i].Payments[j].SaturdaySw;

                  objPayments.Amount = this.paymentHistory[i].Payments[j].Amount;
                  objPayments.ICF = this.paymentHistory[i].Payments[j].ICF;
                  objPayments.PaymentMethod = this.paymentHistory[i].Payments[j].PaymentMethod;
                  objPayments.Status = this.paymentHistory[i].Payments[j].Status;
                  this.payments.push(objPayments);
                  this.paymentsListWithoutFilter.push(objPayments);
                  this.manageAllRows('false');
                }
                this.isNorecordsfound = true;
              } else {
                this.isNorecordsfound = false;
              }
            }
            this.groupingPaymentlist();

          } else {

            this.isNorecordsfound = false;
          }
          this.sharedService.loading.next(false);

        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );

  }

  toggleRow(element, i) {
    element.expanded = !element.expanded;
    this.changeToggleIcon(i -1);
  }

  manageAllRows(expanded) {
    this.collapse = !this.collapse;
    this.paymentHistory.forEach(rows => {
     // console.log(rows);
      rows.Payments.forEach(row => {
     //   console.log(row);
        row.expanded = this.collapse;
      });
    });
  }

  changeToggleIcon(i) {
   // this.paymentHistory.Payments.forEach(rows => {
      const areAllRowsCollapsed = _.every(this.paymentHistory[i].Payments , data => data.expanded === false);
      if (areAllRowsCollapsed) {
              this.collapse = false;
      } else {
        const areAllRowsExpanded = _.every(this.paymentHistory[i].Payments , data => data.expanded === true);
        if (areAllRowsExpanded) {
          this.collapse = true;
        }
    }
  //  })
  }

  public onChange(event): void {
    console.dir(event);
    this.currentPage = event;
    this.changeToggleIcon(event -1);
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;

    if (key === 'PaymentDate') {
      // arr.sort((a, b) => {
      //   if (a.name < b.name) return -1  return a.name > b.name ? 1 : 0
      // })
      this.paymentHistory.forEach(rows => {
        rows.Payments.sort((a, b) => {
          if (a.PaymentDate < b.PaymentDate) {
            return -1;
          } else if (a.PaymentDate < b.PaymentDate) {
              return 1;
          } else {
            return 0;
          }
        });
        // rows.Payments.sort((n1, n2) => n2.PaymentDate - n1.PaymentDate);

       });
      this.dateBoolean = !this.dateBoolean;
    } else if (key === 'IntTransactionId') {
      this.paymentHistory.forEach(rows => {
        // console.log(rows);
        rows.Payments.sort((n1, n2) => n2.IntTransactionId - n1.IntTransactionId);

       });
      this.transaction_idBoolean = !this.transaction_idBoolean;
    } else if (key === 'Amount') {
      this.paymentHistory.forEach(rows => {
        // console.log(rows);
        rows.Payments.sort((n1, n2) => n2.Amount - n1.Amount);

       });

      this.amountBoolean = !this.amountBoolean;
    } else {
      this.paymentHistory.forEach(rows => {
        rows.Payments.sort((a, b) => {
          if (a.Status < b.Status) {
            return -1;
          } else if (a.Status < b.Status) {
              return 1;
          } else {
            return 0;
          }
        });
        // rows.Payments.sort((n1, n2) => n2.PaymentDate - n1.PaymentDate);

       });
      this.statusBoolean = !this.statusBoolean;
    }
    if(this.reverse){
      this.key='-'+this.key;  
    }
  }

  groupingPaymentlist() {
    if (this.payments.length > 0) {
      let groups = '';

      groups = this.payments.reduce(function(obj, item) {
        obj[item.IntTransactionId] = obj[item.IntTransactionId] || [];
        obj[item.IntTransactionId].push(item);
        return obj;
      }, {});
      this.groupedPaymentList = Object.keys(groups).map(function(key) {
        return { paymentKey: key, childitems: groups[key] };
      });
    } else {
    }
    let count: any = this.payments.length;
    for (let i = 0; i < this.groupedPaymentList.length; i++) {

      let obj: any = [];
      obj = this.groupedPaymentList[i].childitems;
      this.groupedPaymentList[i].childitems = obj.sort(function(a, b) {
        return (a.FirstName + ' ' + a.LastName) === (b.FirstName + ' ' + b.LastName) ? 0 : (a.FirstName + ' ' + a.LastName) > (b.FirstName + ' ' + b.LastName) ? -1 : 1;
      });
      for (let j = 0; j < this.groupedPaymentList[i].childitems.length; j++) {
        count = count - 1;
        this.payments[count] = this.groupedPaymentList[i].childitems[j];
      }
    }
  }

  getFormatedData(data): any {
    const classDays = [];
    let formatedData;
    if (data.SundaySw === true) {
      classDays.push('Sun');
    }
    if (data.MondaySw === true) {
      classDays.push('Mon');
    }
    if (data.TuesdaySw === true) {
      classDays.push('Tue');
    }
    if (data.WednesdaySw === true) {
      classDays.push('Wed');
    }
    if (data.ThursdaySw === true) {
      classDays.push('Thu');
    }
    if (data.FridaySw === true) {
      classDays.push('Fri');
    }
    if (data.SaturdaySw === true) {
      classDays.push('Sat');
    }
    formatedData = classDays.join();
    return formatedData;
  }

  getPaymentHistoryReport(obj) {

    this.sharedService.loading.next(true);
    this.dataService.getPaymentHistoryReport(obj)
      .subscribe(
        async (response: any) => {
          if (response.body.APIStatus === 'Success' && response.status === 200) {

            if (this.isEmailMe) {
              const userInfo = JSON.parse(localStorage.getItem('userInfo'));
              const message = this.translate.instant('report_sent') + userInfo.UserName;
              this.alertService.successAlert(message);
            } else {

              if (response.ReportType === this.translate.instant(this.translate.instant('Excel'))) {
                this.fileName = 'PayemntHistory.xls';
              } else {

                this.fileName = 'PayemntHistory.pdf';
              }

              const base64: any = response.ReportData;
              this.sharedService.downloadPdf(base64, this.fileName);

            }
          } else if (response.body.APIStatus === 'Error' && response.body.APIStatusReason === 'ERROR_CONTACT_SUPPORT') {
            const message = this.translate.instant('ERROR_CONTACT_SUPPORT');
            this.alertService.failureToast(message);
          } else {
            const message = this.translate.instant('error_due_to');
            this.alertService.checkPEProcessingMessages(response.body, message);
          }
          this.sharedService.loading.next(false);

        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }




  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  onResetAll() {
    this.paymentsListWithoutFilter = [];
    this.payments = this.paymentsListWithoutFilter;
    if (this.payments.length === 0) {
      this.isNorecordsfound = false;
     } else {
      this.isNorecordsfound = true;
    }
    this.selectedMealType = 'All';
    this.selectedDateType = '30';
    this.selectStartDate = '';
    const datePipe = new DatePipe('en-US');
    this.selectEndDate = new Date().toISOString();
    const onloadrequestdata = {
      StartDate: datePipe.transform(this.startdate, 'MM/dd/yyyy'),
      EndDate: datePipe.transform(this.enddate, 'MM/dd/yyyy'),
      Type: this.selectedMealType,
    };
    this.getAllPaymentHistory(onloadrequestdata);


  }

  scrollLeft() {
    const widgetsContent: any = this.widgetsContent;
    widgetsContent.el.scrollLeft -= 150;
  }

  scrollRight() {
    const widgetsContent: any = this.widgetsContent;
    widgetsContent.el.scrollLeft += 150;
  }

  scrollHandler(event) {
    if (event.target.scrollLeft === 0) {
      this.disbleLeftScrollButton = true;
    } else {
      this.disbleLeftScrollButton = false;
    }

    if (event.target.scrollWidth === (event.target.scrollLeft + event.target.clientWidth)) {
      this.disbleRightScrollButton = true;
    } else {
      this.disbleRightScrollButton = false;
    }
  }



  ionViewDidEnter() {
    const ionSelects = document.querySelectorAll('ion-select');
    ionSelects.forEach((sel) => {
      sel.shadowRoot.querySelectorAll('.select-icon-inner')
        .forEach((elem) => {
          elem.setAttribute('style', 'display: none;');
        });
    });
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

    if(this.selectStartDate){
      const date = new Date(this.selectStartDate);
      date.setDate(date.getDate() + 1);
      this.paymentSelectedDate = date.toISOString();
    }else{
      this.paymentSelectedDate = this.maxDate;
    }
   
      this.paymentSelectedEndDate = this.maxDate;
  }
}

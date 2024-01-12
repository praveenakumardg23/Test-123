import { AlertController, Platform, NavController } from '@ionic/angular';
import { DataService } from './../services/data/data.service';
import { SharedService } from 'src/app/services/shared/shared.service';
import { TransactionsType } from './../services/data/model/reports';
import { LanguageService } from './../services/language/language.service';
import { Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AlertService } from '../services/alert/alert.service';
import { DocumentViewer, DocumentViewerOptions } from '@awesome-cordova-plugins/document-viewer/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  visibleDivIndices: number[] = [];
  category = 'meal';
  patrons: any;
  STDate;
  EDate;
  SDate;
  ENDate;
  fundDate;
  mealDate;
  IsFundFormValid: boolean = true;
  IsMealFormValid: boolean = true;
  districtFeatureList: any;
  isDistrictSourceAccount = false;
  isNoRecordsFound: boolean = false;
  cartCount: number;
  allPatronSourceAccounts: any;
  filteredSourceAccounts: any;
  selectedFundAccount;
  filterdPatronsList: any;
  filterdSourceAccounts: any;
  selectEndDate;
  showMealReport:boolean=false;
  showFundReport:boolean=false;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  mealActivityReportObj = {
    selectedPatrons: [],
    selectedDate: '2',
    startDate: '',
    endDate: ''
  };
  fundAccountReportObj = {
    selectedAccountName: '',
    selectedPatrons: [],
    selectedDate: '2',
    startDate: '',
    endDate: ''
  }
  reporttype: any;
  selectedPatron: any;
  form_data:NgForm;
  view_report_payload: any = {} ;
  viewReportType: any;
  dataNotFound:boolean=false;
  maxDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd'); 
  minDate = this.datePipe.transform("1994-03-14", 'yyyy-MM-dd'); 

  constructor(
    private translate: TranslateService,
    public languageService: LanguageService,
    private router: Router,
    private sharedService: SharedService,
    private dataService: DataService,
    private alertController: AlertController,
    private alertService: AlertService,
    private document: DocumentViewer,
    private transfer: FileTransfer,
    private file: File,
    private platform: Platform,
    private datePipe: DatePipe,
    private navCtrl: NavController) {
    this.districtFeatureList = JSON.parse(localStorage.getItem('districtFeaturelist'));
  }



  ngOnInit() {
    this.maxDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd'); 
    this.minDate = this.datePipe.transform("1994-03-14", 'yyyy-MM-dd');
    this.dataNotFound = false;
    this.STDate = new Date();
    this.EDate = new Date();
    this.SDate = new Date();
    this.ENDate = new Date();

    
    // setTimeout(() => {
    //   this.toggleVisibility(0)
    //   this.toggleVisibility(2)
    // }, 6700);
  }

  ionViewWillEnter() {
    this.dataNotFound = false;
    this.showFundReport = this.showMealReport = false;
    this.selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
    this.reporttype = localStorage.getItem("VMH");
    this.isDistrictSourceAccount = this.districtFeatureList.SourceAccount;
    this.selectEndDate = new Date().toISOString();
    this.getUserPatrons();
    this.sharedService.cartCount.subscribe((cartCount) => {
      this.cartCount = cartCount;
    })
    this.getAllPatronSourceAccounts();
    this.toggleVisibility(0)
    this.toggleVisibility(2)
  }

  /** reset the dates on change of report */
  onSelectedDateChange(selectedDate) {
    
    if (selectedDate === '4') {
      setTimeout(() => {
        this.toggleVisibility(0)
      }, 50);
      this.mealActivityReportObj.startDate = "";
      this.mealActivityReportObj.endDate = this.selectEndDate;
    }
    
  }
  onFundSelectedDateChange(selectedDate) {
    if (selectedDate === '4') {
      setTimeout(() => {
        this.toggleVisibility(2)
      }, 50);
      this.fundAccountReportObj.startDate = "";
      this.fundAccountReportObj.endDate = this.selectEndDate;
    }
  }

  /** segment change event on selectuon of report */
  segmentChanged(event) {
    this.category = event.detail.value;
    if(this.category === 'meal'){
      this.showFundReport = false;
    }else{
      this.showMealReport = false;
    }
    this.reporttype = ''
    this.mealActivityReportObj = {
      selectedPatrons: [],
      selectedDate: '2',
      startDate: '',
      endDate: ''
    };
    this.fundAccountReportObj = {
      selectedAccountName: '',
      selectedPatrons: [],
      selectedDate: '2',
      startDate: '',
      endDate: ''
    }
  }

  onBack() {
    const previousPath = sessionStorage.getItem('previousPath');
    // this.router.navigate([previousPath])
    this.navCtrl.navigateBack(previousPath);
  }

  /** Meal custom date validation */
  mealStartdateChange(SD, f: NgForm, i) {
    // this.SDate = SD;
    
    console.log(this.ENDate)
    this.SDate = this.datePipe.transform(SD, 'MM/dd/yyyy')
    this.ENDate = this.datePipe.transform(this.ENDate, 'MM/dd/yyyy')
    if (new Date(this.SDate) > new Date(this.ENDate)) {
      this.IsMealFormValid = false
    }
    else {
      this.IsMealFormValid = true
    }
    this.mealActivityReportObj.startDate  = this.SDate;
    this.toggleVisibility(i)
  }

  mealEnddateChange(END, f: NgForm, i) {
    this.ENDate = this.datePipe.transform(END, 'MM/dd/yyyy')
    // this.ENDate = END;
    if (new Date(this.SDate) > new Date(this.ENDate)) {
      this.IsMealFormValid = false
    }
    else {
      this.IsMealFormValid = true
    }
    this.mealActivityReportObj.endDate  = this.ENDate;
    this.toggleVisibility(i)
  }

  /** fund custom date validation */
  fundStartdateChange(STD, f1: NgForm, i) {
    // this.STDate = STD;
    this.STDate = this.datePipe.transform(STD, 'MM/dd/yyyy')
    this.EDate = this.datePipe.transform(this.EDate, 'MM/dd/yyyy')
    if (new Date(this.STDate) > new Date(this.EDate)) {
      this.IsFundFormValid = false
    }
    else {
      this.IsFundFormValid = true
    }
    this.toggleVisibility(i)
  }

  fundEnddateChange(ED, f1: NgForm, i) {
    this.EDate = ED;
    if (new Date(this.STDate) > new Date(this.EDate)) {
      this.IsFundFormValid = false
    }
    else {
      this.IsFundFormValid = true
    }
    this.toggleVisibility(i)
  }

  getAllPatronSourceAccounts() {
    this.sharedService.loading.next(true);
    this.dataService.getAllPatronSourceAccounts()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.APIStatus == 'Success') {
            this.allPatronSourceAccounts = response.body.Patrons;
            let allPatronsSourceAccountsArray = [];
            this.allPatronSourceAccounts.forEach((items, index) => {
              items.SourceAccounts.forEach((sourceAccount) => {
                const obj = {
                  "IntSiteId": items.IntSiteId,
                  "SiteId": items.SiteId,
                  "IntDistrictId": items.IntDistrictId,
                  "IntPatronId": items.IntPatronId,
                  "PatronId": items.PatronId,
                  "FirstName": items.FirstName,
                  "LastName": items.LastName,
                  "IntUserId": items.IntUserId,
                  "Active": items.Active,
                  "IntPatronAccountId": sourceAccount.IntPatronAccountId,
                  "IntFundId": sourceAccount.IntFundId,
                  "AccountName": sourceAccount.AccountName,
                  "Balance": sourceAccount.Balance
                }
                if (allPatronsSourceAccountsArray.findIndex(i => i.IntFundId == sourceAccount.IntFundId) === -1) {
                  allPatronsSourceAccountsArray.push(obj)
                }
              });
            });
            this.filterdSourceAccounts = allPatronsSourceAccountsArray;
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  onFundAccountSelection(event) {
    this.selectedFundAccount = event.detail.value;
    let filterdPatrons = []
    this.allPatronSourceAccounts.forEach((items, index) => {
      items.SourceAccounts.forEach((item, index) => {
        if (item.IntFundId == this.selectedFundAccount.IntFundId) {
          const obj = {
            "FirstName": items.FirstName,
            "LastName": items.LastName,
            "IntPatronId": items.IntPatronId,
            "IntUserId": items.IntUserId,
            "IntDistrictId": items.IntDistrictId,
            "IntSiteId": items.IntSiteId,
            "Active": items.Active,
            "IntPatronAccountId": items.IntPatronAccountId,
            "IntFundId": items.IntFundId,
            "AccountName": items.AccountName,
            "Balance": items.Balance,
          }
          filterdPatrons.push(obj)
        }
      });
    });
    this.filterdPatronsList = filterdPatrons;
  }

  /** get the user patrons api call */
  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);

          this.patrons = response.body.Patrons;
          this.patrons.forEach((patron) => {
            patron.isChecked = false;

          })
          if (this.selectedPatron.type == 'individual') {
            this.mealActivityReportObj.selectedPatrons = [this.selectedPatron.data.IntPatronId]
          }
          
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }


  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  /** check the selected report type */
  onSelectedReportType(obj, type) {
    const alert = this.alertController.create({
      header: this.translate.instant('report_created'),
      buttons: [
        {
          text: this.translate.instant('send_email'),
          handler: () => {
            obj.ReportMethod = 'Email'
            if (this.reporttype == 1) {
              this.getMealActivity(obj);
            } else if (this.reporttype == 2) {
              this.getMealHistory(obj);
            } else if (this.category == 'fund') {
              obj.IntFundId = this.selectedFundAccount.IntFundId;
              this.getFundActivity(obj);
            }
          }
        }
      ]
    });

    alert.then((res) => {
      res.present();
    })
  }



  onCreateMealAcivityReport(reportType, formData?: NgForm) {
    const obj = this.getRequestObj(reportType, this.form_data);
    this.onSelectedReportType(obj, 'meal');
  }

  onCreateFundAccountReport(reportType, formData?: NgForm) {
    this.form_data = formData;
    const obj = this.getRequestObj(reportType, this.form_data);
    obj.StartDate = this.datePipe.transform(this.SDate, 'MM/dd/yyyy');;
    obj.EndDate = this.datePipe.transform(this.EDate, 'MM/dd/yyyy');
    this.onSelectedReportType(obj, 'fund');
  }

  /* filter the dates accoring to the selected date */
  getRequestObj(reportType, formData: NgForm) {
    const datePipe = new DatePipe('en-US');
    let startDateValue;
    let endDateValue;
    if (formData.value.selectedDate == 1) {
      startDateValue = new Date();
      startDateValue.setDate(startDateValue.getDate() - 7);
      startDateValue = datePipe.transform(startDateValue, 'MM/dd/yyyy');
      endDateValue = datePipe.transform(Date.now(), 'MM/dd/yyyy')
    } else if (formData.value.selectedDate == 2) {
      startDateValue = new Date();
      startDateValue.setDate(startDateValue.getDate() - 30);
      startDateValue = datePipe.transform(startDateValue, 'MM/dd/yyyy');
      endDateValue = datePipe.transform(Date.now(), 'MM/dd/yyyy')
    } else if (formData.value.selectedDate == 3) {
      startDateValue = new Date();
      startDateValue.setDate(startDateValue.getDate() - 90);
      startDateValue = datePipe.transform(startDateValue, 'MM/dd/yyyy');
      endDateValue = datePipe.transform(Date.now(), 'MM/dd/yyyy')
    } else if (formData.value.selectedDate == 4) {
      startDateValue = datePipe.transform(formData.value.startDate, 'MM/dd/yyyy');
      endDateValue = datePipe.transform(formData.value.endDate, 'MM/dd/yyyy')
    }
    const obj = {
      "IntSiteId": this.patrons[0].IntSiteId,
      "IntPatronIds": formData.value.selectedPatrons,
      "StartDate": startDateValue,
      "EndDate": endDateValue,
      "ReportType": reportType,
      "ReportMethod": ""
    }
    return obj;
  }

  /** get meal activity api call */
  getMealActivity(reqObj) {
    this.sharedService.loading.next(true);
    this.dataService.getMealActivity(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.generateReport(reqObj, response);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** get meal history api call */
  getMealHistory(reqObj) {
    this.sharedService.loading.next(true);
    this.dataService.getMealHistory(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.generateReport(reqObj, response);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** get fund activity api call */
  getFundActivity(reqObj) {
    this.sharedService.loading.next(true);
    this.dataService.getFundActivity(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.generateReport(reqObj, response);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  /** generate report based on report method */
  generateReport(reqObj, response) {
    if (response.body.APIStatus == 'Success' && response.status == 200) {
      if (reqObj.ReportMethod == 'Email') {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const message = this.translate.instant('Payments_Send_Email') + userInfo.UserName;
        this.alertService.successAlert(message);
      } else {
        if (reqObj.ReportType == 'PDF') {
          this.convertAndDownloadPdf(response.body);
        } else if (reqObj.ReportType == 'Excel') {
          this.convertAndDownloadExcel(response.body);
        }
      }
    } else if (response.body.APIStatus == 'Error' && response.body.APIStatusReason == 'ERROR_CONTACT_SUPPORT') {
      const message = 'This error has been logged. Please contact support if you require further assistance';
      this.alertService.failureToast(message);
    } else {
      const message = 'Error due to -';
      this.alertService.checkPEProcessingMessages(response.body, message);
    }
  }

  /** download the document for PDF format */
  convertAndDownloadPdf(response) {
    let filePath = this.file.applicationDirectory + 'www/assets/pdf';
    if (this.platform.is('android')) {
      let path = null;
      path = this.file.dataDirectory;
      const fileTransfer = this.transfer.create();
      fileTransfer.download('pdf server url', path + 'pdfname.pdf')
        .then(entry => {
          let url = entry.toURL();
          this.document.viewDocument(url, 'application/pdf', {});
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      const options: DocumentViewerOptions = {
        title: 'Server pdf',
        openWith: { enabled: true }
      }
      this.document.viewDocument(`${filePath}/pdfname.pdf`, 'application/pdf', options)
    }
  }

  /** download the document for Excel format */
  /**write now not implemented as the download option is removed */
  convertAndDownloadExcel(response) {
    let filePath = this.file.applicationDirectory + 'www/assets/xls';
    if (this.platform.is('android')) {
      let path = null;
      path = this.file.dataDirectory;
      const fileTransfer = this.transfer.create();
      fileTransfer.download('pdf server url', path + 'pdfname.xls')
        .then(entry => {
          let url = entry.toURL();
          this.document.viewDocument(url, 'application/xls', {});
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      const options: DocumentViewerOptions = {
        title: 'Server excel',
        openWith: { enabled: true }
      }
      this.document.viewDocument(`${filePath}/pdfname.xls`, 'application/xls', options)
    }
  }

  displayReport(formData:NgForm){
    this.showMealReport = this.showFundReport = false;
    setTimeout(()=>{
      this.form_data = formData
      
      this.view_report_payload = this.getRequestObj("PDF", this.form_data);
      if(this.view_report_payload.StartDate == null){
        this.view_report_payload.StartDate = this.SDate;
      }
      if(this.view_report_payload.EndDate == null){
        this.view_report_payload.EndDate = this.datePipe.transform(this.EDate, 'MM/dd/yyyy');
      }
      
      console.log("formData",  this.view_report_payload)
      this.showFundReport = !(this.showMealReport = this.category === 'meal'? true : false);
      this.viewReportType = this.reporttype;
    },200);
  }

  updateDataPresence(){
    this.dataNotFound = true;
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
    if(this.mealActivityReportObj.startDate){
      const date = new Date(this.mealActivityReportObj.startDate);
      date.setDate(date.getDate() + 1);
      this.mealDate = date.toISOString();
    }else{
      this.mealDate = this.maxDate;
    }
    if(this.fundAccountReportObj.startDate){
      const date = new Date(this.fundAccountReportObj.startDate);
      date.setDate(date.getDate() + 1);
      this.fundDate = date.toISOString();
    }else{
      this.fundDate = this.maxDate;
    }
  }

 

}

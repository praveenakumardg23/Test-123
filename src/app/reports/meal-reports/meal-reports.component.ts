import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { ReportType } from 'src/app/services/data/model/reports';
import { SharedService } from 'src/app/services/shared/shared.service';
import { LanguageService } from 'src/app/services/language/language.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-meal-reports',
  templateUrl: './meal-reports.component.html',
  styleUrls: ['./meal-reports.component.scss'],
})
export class MealReportsComponent implements OnInit {

  @Input() reportType;
  @Input() view_report_payload: any;
  @Output() checkDataPresence: EventEmitter<any> = new EventEmitter;
  transaction_idBoolean:boolean =false;
  saleDate_Boolean:boolean =false;
  mealPeriod_Boolean:boolean =false;
  totalSale_Boolean:boolean =false;
  public Report_Type=ReportType;
  public count = 0;
  public itemsPerPage = 1;
  public currentPage = 1;
  reportData: any;
  patronName: string = "";
  patronId: number;
  groupedData: any;
  staticData: any;
  isRecordFound: boolean = false;
  reportName:string="";
  collapse:boolean = true;
  key: string="transaction";
  reverse: boolean=false;
  constructor(private dataService: DataService,public languageService: LanguageService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.transaction_idBoolean=false;
    this.saleDate_Boolean=false;
    this.mealPeriod_Boolean=false;
    this.totalSale_Boolean=false;
    this.reverse=false;
    this.isRecordFound = false;
    this.getReportData();
    this.reportName=this.reportType==="1" ? "Meal Activity Report" : "Meal Account Report";
  }

  getReportData() {
    if (this.reportType === "1") {
      this.view_report_payload.ReportMethod = "View"
      this.view_report_payload.ReportType = "pdf"
      this.getMealActivityReport(this.view_report_payload);
    } else {
      this.view_report_payload.ReportMethod = "VIEW"
      this.getMealAccountReport(this.view_report_payload);
    }
  }

  getMealAccountReport(payload?: any) {
    this.sharedService.loading.next(true);
    this.dataService.getMealAccountReport(payload).subscribe(
      (data: any) => {
        this.sharedService.loading.next(false);
        if (data.body.APIStatus === "Success") {
          if (data.body.mealHistoryTransactionDetails) {
            this.isRecordFound = true;
            this.staticData = data.body.mealHistoryTransactionDetails;
            this.groupingData();
          } else {
            this.checkDataPresence.emit();
            this.isRecordFound = false;
          }
        } else {
          this.isRecordFound = false;
          this.checkDataPresence.emit();
        }
      },
      (error) => {
        this.sharedService.loading.next(false);
        console.log(error);
      });
  }

  groupingData() {
    if (this.reportType === '2') {
      for (let i = 0; i < this.staticData.length; i++) {
        if (this.staticData[i].Description.includes("<br>")) {
          this.staticData[i].DescriptionArray = [];
          this.staticData[i].PriceArray = [];
          this.staticData[i].DescriptionArray.push(this.staticData[i].Description.split("<br>"));
          this.staticData[i].PriceArray.push(this.staticData[i].Price.split("<br>"));
        }
      }
    }
    if (this.staticData.length > 0) {
      let groups = '';
      groups = this.staticData.reduce(function (obj, item) {
        if (item.MName.length > 0) {
          obj[item.FName + " " + item.MName + " " + item.LName] = obj[item.FName + " " + item.MName + " " + item.LName] || [];
          obj[item.FName + " " + item.MName + " " + item.LName].push(item);
        }
        else {
          obj[item.FName + " " + item.LName] = obj[item.FName + " " + item.LName] || [];
          obj[item.FName + " " + item.LName].push(item);
        }
        return obj;
      }, {});
      this.groupedData = Object.keys(groups).map(function (key) {
        return { PatronName: key, childitems: groups[key] };
      });
    }
    let obj: any = this.groupedData;
    this.groupedData = obj.sort(function (a, b) {
      return (a.PatronName) == (b.PatronName) ? 0 : (a.PatronName) < (b.PatronName) ? -1 : 1;
    });
    this.reportData = this.groupedData;
    this.reportData.forEach((data:any)=>{
      data.childitems.forEach((data2:any)=>{
        data2.PaymentDataList.forEach((data3:any)=>{
          data3.Payment = data3.Payment.split("|");
        })
        data2.expanded=false;
      })
    });
    console.log(this.reportData, "Grouped Report Data");
  }

  public onChange(event): void {
    console.dir(event);
    this.currentPage = event;
  }

  getMealActivityReport(payload?: any) {
    this.sharedService.loading.next(true);
    this.dataService.getMealActivity(payload).subscribe(
      (response: any) => {
        response = response.body;
        this.sharedService.loading.next(false);
        if (response.APIStatus === 'Success') {
          if(response.ReportDataList){
            this.isRecordFound = true;
            this.staticData = response.ReportDataList;
          }
          console.log(this.staticData, "response Data");
          this.groupingData();
        } else if (response.APIStatus === 'Error') {
          this.isRecordFound = false;
        }
      },
      (error) => {
        this.isRecordFound = false;
        this.sharedService.loading.next(false);
        console.log(error);
      });

  }

  groupingMealActivityData() { }

  manageAllRows(expanded) {
    this.collapse = !this.collapse;
    this.reportData.forEach((data:any)=>{
      data.childitems.forEach((data2:any)=>{
        data2.expanded=expanded;
      })
    });

  }

  toggleRow(element,i) {
    console.log("Toggle Expand before: ",element);
    element.expanded = !element.expanded;
    this.changeToggleIcon(i-1);
  }

  changeToggleIcon(i) {
       const areAllRowsCollapsed = _.every(this.reportData[i].childitems , data => data.expanded === false);
       if (areAllRowsCollapsed) {
               this.collapse = true;
       } else {
         const areAllRowsExpanded = _.every(this.reportData[i].childitems , data => data.expanded === true);
         if (areAllRowsExpanded) {
           this.collapse = false;
         }
     }
    }
    
  sort(key,flag:boolean){
    console.log(this.reportData,"report data in  sort",flag)
    this.key = key;
    this.reverse = !this.reverse;
    
        if(key === 'SaleDate'){
          console.log("sort saledate");
          this.saleDate_Boolean = !this.saleDate_Boolean;
          this.reportData.forEach((data:any)=>{
            data.childitems.sort((n1,n2) => n2.SaleDate - n1.SaleDate);
            });
        }else if(key === 'IntTransactionId'){
          console.log("sort transaction");
          this.transaction_idBoolean = !this.transaction_idBoolean;
        }
        else if(key === 'MealPeriod'){
          console.log("sort mealperiod");
          this.mealPeriod_Boolean = !this.mealPeriod_Boolean;
        }else{
          console.log("sort Amount");
          this.totalSale_Boolean = !this.totalSale_Boolean;
          this.reportData.forEach((data:any)=>{
          data.childitems.sort((n1,n2) => n2.Amount - n1.Amount);
          });
        }
        if(this.reverse){
          this.key='-'+this.key;  
        }
  }
}

import { Router } from '@angular/router';
import { AppConfiguration } from './../../app-configuration';
import { DataService } from './../data/data.service';
import { SafariViewController } from '@awesome-cordova-plugins/safari-view-controller/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  langDir:string = 'ltr';
  modalClass:string = 'directionLTR';
  firstLogin = false;
  TabValid:boolean = false;
  FundraiserShow:boolean = false;
  UserInfoData: any;
  userPatronsInfo: any;
  loading = new BehaviorSubject(false);
  appPhase = new BehaviorSubject('register');
  pageHeaderTitle = new BehaviorSubject('Your Profile');
  selectPatronWithData: any;
  downloadPdf: any;
  FundTransfer: any;
  userPatronsList = new BehaviorSubject([]);
  reloadingCurrentView: EventEmitter<any> = new EventEmitter();
  cartCount = new BehaviorSubject(0);
  messageCount = new BehaviorSubject(0);
  SelectedAR = new Subject();
  refreshCart = new BehaviorSubject(false);
  DashboardAR: any;
  viewHistoryData: any;
  refreshManageProfile = new BehaviorSubject(false);
  allDistrictFeatureList: any;
  districtSettings = new BehaviorSubject('list');
  languageId: EventEmitter<any> = new EventEmitter();
  securityQuestionList = new Subject();
  selectedPatronsForCafeteriaTransfer:any=[];
  isGuestUser = false;
  receiptData:any;

  constructor(private platform: Platform,
    private iab: InAppBrowser,
    private safariViewController: SafariViewController,
    private dataService: DataService,
    private translate: TranslateService,
    private appConfiguration: AppConfiguration,
    private router: Router
  ) {
    this.appPhase.subscribe((phase) => {
      const globals = JSON.parse(sessionStorage.getItem('globals') );
      if (phase == 'registrationPhase' && globals) {
        this.getDistrictFeatureList('', 'getpatrons')
      }
    })
  }

  setViewHistoryData(data:any) {
    this.viewHistoryData = data;
  }

  getViewHistoryData() {
    return this.viewHistoryData;
  }

  setDashboardAR(data:any) {
    this.DashboardAR = data;
  }

  

  getDashboardAR() {
    return this.DashboardAR;
  }

  setFundTransfer(data:any) {
    this.FundTransfer = data;
  }

  getFundTransfer() {
    return this.FundTransfer;
  }

  public setSelectedAR(Data:any): void {
    this.SelectedAR.next(Data);
  }

  public getSelectedAR() {
    return this.SelectedAR;
  }

  getsecurityQuestion() {
    return this.securityQuestionList;
  }

  setSecurityQuestions(data:any) {
    this.securityQuestionList.next(data);
  }

  setselectPatronWithData(data:any) {
    this.selectPatronWithData = data;
  }

  getselectPatronWithData() {
    return this.selectPatronWithData;
  }

  setUserInfo(data:any) {
    this.UserInfoData = data;
  }


  getUserInfo() {
    return this.UserInfoData;
  }

  setPatronsInfo(data:any) {
    this.userPatronsInfo = data;
  }

  getPatronsInfo() {
    return this.userPatronsInfo;
  }

  openSystemBrowser(url:any) {
    const options: InAppBrowserOptions = {
      closebuttoncolor: 'white',
      toolbarcolor: '#3CBFAE',
      navigationbuttoncolor: 'white',
      footer: 'no',
      footercolor: '#3CBFAE',
    }
    let target = "_system";
    this.iab.create(url, target, options);
  }

  openUrlInAppBrowser(url:any) {
    const options: InAppBrowserOptions = {
      closebuttoncolor: 'white',
      toolbarcolor: '#3CBFAE',
      navigationbuttoncolor: 'white',
      footer: 'no',
      footercolor: '#3CBFAE',
    }
    let target = "_system";
    const mobileBrowser = this.iab.create(url, target, options);
    let onMobileBrowserExit = mobileBrowser.on('exit');
    if (onMobileBrowserExit) {
      onMobileBrowserExit.subscribe(() => {
        const baseUrl = url.split("?");
        if (baseUrl[0] == this.appConfiguration.mmoUrl) {
          this.getCartItemsPreorder();
        }
      });
    }
  }

  openUrl(url:any) {
    if (this.platform.is("desktop")) {
      window.open(url);
    }
    if (this.platform.is('android')) {
      this.openUrlInAppBrowser(url);
    } else if (this.platform.is('ios')) {
      this.safariViewController.isAvailable()
        .then((available: boolean) => {
          if (available) {
            this.safariViewController.show({
              url: url,
              hidden: false,
              animated: false
            })
              .subscribe((result: any) => {
                if (result.event === 'opened') { }
                else if (result.event === 'loaded') { }
                else if (result.event === 'closed') {
                  const baseUrl = url.split("?");
                  if (baseUrl[0] == this.appConfiguration.mmoUrl) {
                    this.getCartItemsPreorder();
                  }
                }
              },
                (error: any) => console.error(error)
              );
          } else {
            this.openUrlInAppBrowser(url);
          }
        })
    }
  }

  updateUserMessages(type:string, data:any) {
    let reqObj;
    if (type == 'deleteonemessage') {
      reqObj = {
        "Messages": [
          {
            "IntMessageUserId": data.IntMessageUserId,
            "MarkInactive": true
          }
        ]
      }

    } else if (type == 'deleteselected') {
      const array:any = [];
      data.forEach((res:any) => {
        const obj = {
          "IntMessageUserId": res.IntMessageUserId,
          "MarkInactive": true
        }
        array.push(obj);
      })
      reqObj = {
        "Messages": array
      }

    } else if (type == 'markasread') {
      reqObj = {
        "Messages": [
          {
            "IntMessageUserId": data.IntMessageUserId,
            "MarkRead": true,
            "MarkInactive": false
          }
        ]
      }
    }

    return this.dataService.updateUserMessages(reqObj);
  }

  getCartCount(response:any) {
    const guestcheckout = localStorage.getItem('isGuestCheckout')
    if(guestcheckout && guestcheckout !== 'true'){
      this.getTabData();
    }
    
    const cartItems = response.body.Patrons;
    const assignedFeesPaymentsModifiedArray:any = [];
    const optionalFeesPaymentsModifiedArray:any = [];
    const sourceAccountModifiedArray:any = [];
    const mealPaymentsModifiedArray:any = [];
    const fundraiserArray:any = [];
    cartItems.forEach((cartItem:any) => {
      cartItem.AssignedFees.forEach((Payment:any) => {
        const obj = {
          "IntSiteId": cartItem.IntSiteId,
          "IntPatronId": cartItem.IntPatronId,
          "IntUserId": cartItem.IntUserId,
          "ItemName": 'Assigned Fee',
          "IntPatronCartId": Payment.IntPatronCartId,
          "IntFeePatronId": Payment.IntFeePatronId,
          "FeeName": Payment.FeeName,
          "FeeCode": Payment.FeeCode,
          "FeeDescription": Payment.FeeDescription,
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
          "DiscountAmount": Payment.DiscountAmount
        }
        assignedFeesPaymentsModifiedArray.push(obj);
      })

      cartItem.OptionalFees.forEach((Payment:any) => {
        const obj = {
          "IntSiteId": cartItem.IntSiteId,
          "IntPatronId": cartItem.IntPatronId,
          "IntUserId": cartItem.IntUserId,
          "ItemName": 'Optional Fee',
          "IntPatronCartId": Payment.IntPatronCartId,
          "IntFeePatronId": Payment.IntFeePatronId,
          "IntFeeId": Payment.IntFeeId,
          "FeeName": Payment.FeeName,
          "FeeCode": Payment.FeeCode,
          "FeeDescription": Payment.FeeDescription,
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
          "DiscountAmount": Payment.DiscountAmount
        }
        optionalFeesPaymentsModifiedArray.push(obj);
      })
      cartItem.Fundraiser.forEach((Payment:any) => {
        const obj = {
          "IntSiteId": cartItem.IntSiteId,
          "IntPatronId": cartItem.IntPatronId,
          "IntUserId": cartItem.IntUserId,
          "ItemName": 'Assigned Fee',
          "IntPatronCartId": Payment.IntPatronCartId,
          "IntFeePatronId": Payment.IntFeePatronId,
          "FeeName": Payment.FeeName,
          "FeeCode": Payment.FeeCode,
          "FeeDescription": Payment.FeeDescription,
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
          "DiscountAmount": Payment.DiscountAmount
        }
        fundraiserArray.push(obj);
      })

      cartItem.SourceAccountPayments.forEach((Payment:any) => {
        const obj = {
          "IntSiteId": cartItem.IntSiteId,
          "IntPatronId": cartItem.IntPatronId,
          "IntUserId": cartItem.IntUserId,
          "ItemName": 'Fund',
          "IntPatronCartId": Payment.IntPatronCartId,
          "IntPatronAccountId": Payment.IntPatronAccountId,
          "FundName": Payment.FundName,
          "IsPaid": Payment.IsPaid,
          "Active": Payment.Active,
          "CartAmount": Payment.CartAmount,
        }
        sourceAccountModifiedArray.push(obj);
      })

      cartItem.MealPayments.forEach((Payment:any) => {
        const obj = {
          "IntSiteId": cartItem.IntSiteId,
          "IntPatronId": cartItem.IntPatronId,
          "IntUserId": cartItem.IntUserId,
          "ItemName": 'Meal',
          "IntPatronCartId": Payment.IntPatronCartId,
          "IntAccountId": Payment.IntAccountId,
          "AccountName": Payment.AccountName,
          "IsPaid": Payment.IsPaid,
          "Active": Payment.Active,
          "CartAmount": Payment.CartAmount
        }
        mealPaymentsModifiedArray.push(obj);
      })
    })
    
    if(this.TabValid){
      if(!this.FundraiserShow){
        this.cartCount.next(0);
      }else{
        const cartData = [...assignedFeesPaymentsModifiedArray, ...optionalFeesPaymentsModifiedArray, ...sourceAccountModifiedArray, ...mealPaymentsModifiedArray, ...fundraiserArray];
        this.cartCount.next(cartData.length);
      }
      
    }else{
      const cartData = [...assignedFeesPaymentsModifiedArray, ...optionalFeesPaymentsModifiedArray, ...sourceAccountModifiedArray, ...mealPaymentsModifiedArray, ...fundraiserArray];
        this.cartCount.next(cartData.length);
    }
  }

  setLanguage() {
    let selectedLang:any;
    const userInfo = JSON.parse(localStorage.getItem('userInfo') );
    let globals: any = JSON.parse(sessionStorage.getItem('globals') );

    if (globals != null) {
      let selectedLangCode = sessionStorage.getItem('selectedLangCode');
      if (selectedLangCode) {
        selectedLang = selectedLangCode;
      } else {
        selectedLang = userInfo.IntLanguageId;
      }
    } else {
      selectedLang = localStorage.getItem('selectedLangCode');
      if (selectedLang) {
        selectedLang = selectedLang;
      } else {
        selectedLang = '1';
        localStorage.setItem('selectedLangCode', selectedLang);
      }

    }
    if (selectedLang == 8) {
      this.translate.use('uz');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang == 2) {
      this.translate.use('es');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if(selectedLang == 3) {
      this.translate.use('ar');
      this.langDir = "rtl"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if (selectedLang === 4){
      this.translate.use('ja');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if (selectedLang === 5){
      this.translate.use('ko');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if (selectedLang === 6){
      this.translate.use('ru');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    }else if (selectedLang === 7){
      this.translate.use('zh');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
    } else {
      this.translate.use('en');
      this.langDir = "ltr"
      let classLi = window.document.getElementById('modalDir')?.classList;
      this.modalClass = (this.langDir === "rtl")? 'directionRTL':'directionLTR';
      if(classLi){
        classLi.remove("directionRTL");
        classLi.remove("directionLTR");
        classLi.add(this.modalClass);
      }
      
    }
  }

  getUserInformation() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') )
    if (userInfo) {
      this.setLanguage();
    } else {
      this.loading.next(true);
      this.dataService.getUserInfo()
        .subscribe(
          (response: any) => {
            this.loading.next(false);
            const userInfo = response.body;
            delete userInfo.ACHStatus;
            delete userInfo.APIStatus;
            delete userInfo.APIStatusReason;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            this.setLanguage();
          },
          (error) => {
            this.loading.next(false);
            console.log(error);
          }
        )
    }
  }

  getDistrictFeatureList(data:any, type:string) {
    this.loading.next(true);
    this.dataService.getDistrictFeatureList()
      .subscribe(
        (response: any) => {
          this.loading.next(false);
          this.allDistrictFeatureList = response.body.Districts;
          if (type == 'managepatron') {
            this.setDistrictFeature(data);
          } else if (type == 'getpatrons') {
            this.getUserPatrons();
          }
        },
        (error) => {
          this.loading.next(false);
          console.log(error);
        }
      )
  }

  getUserPatrons() {
    this.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.loading.next(false);
          const viewPatrons = response.body.Patrons;
          this.userPatronsList.next(response.body.Patrons);
          this.setDistrictFeature(viewPatrons);
        },
        (error) => {
          this.loading.next(false);
          console.log(error);
        }
      )
  }

  setDistrictFeature(viewPatrons:any) {
    if (viewPatrons.length > 0) {
      const firstPatronObj = viewPatrons[0];
      const districtFeaturelist = this.allDistrictFeatureList.filter((districtFeaturelist:any) => {
        if (districtFeaturelist.IntDistrictId == firstPatronObj.IntDistrictId) {
          return districtFeaturelist;
        }
      })
      if(districtFeaturelist.length > 0){
        localStorage.setItem('districtFeaturelist', JSON.stringify(districtFeaturelist[0]));
      this.getTabData();
      }
      
    } else if (viewPatrons.length == 0) {
      localStorage.removeItem('districtFeaturelist');
    }
  }

  getTabData() {
    const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist') );
    if(districtFeaturelist !==null){
      const tabData = [
        {
          "tabValue": "meals",
          "tabTitle": this.translate.instant('Meal'),
          "tabIcon": "restaurant",
          "showTab": districtFeaturelist.Lunch,
          "sortOrder": districtFeaturelist.LunchSortOrder,
          "route": "/dashboard/patron-detail/meals"
        },
        {
          "tabValue": "fees",
          "tabTitle": this.translate.instant('fees'),
          "tabIcon": "clipboard",
          "showTab": districtFeaturelist.Fees,
          "sortOrder": districtFeaturelist.FeesSortOrder,
          "route": "/dashboard/patron-detail/fees"
        },
        {
          "tabValue": "fund",
          "tabTitle": this.translate.instant('Fund'),
          "tabIcon": "logo-usd",
          "showTab": districtFeaturelist.SourceAccount,
          "sortOrder": districtFeaturelist.SourceAccountSortOrder,
          "route": "/dashboard/patron-detail/fund"
        }
      ]
  
      tabData.sort((a, b) => {
        if (a.sortOrder < b.sortOrder) return -1;
        else if (a.sortOrder > b.sortOrder) return 1;
        else return 0;
      });
      this.TabValid = tabData.map((tab:any) =>{
        return tab.showTab === false;
      }).every((item:any) => item=== true);
      if(this.TabValid){
        return;
      }
      if (tabData[0].showTab) {
        localStorage.setItem('dashboardRedirectPath', tabData[0].route);
      } else if (tabData[1].showTab) {
        localStorage.setItem('dashboardRedirectPath', tabData[1].route);
      } else {
        localStorage.setItem('dashboardRedirectPath', tabData[2].route);
      }
    }
    
  }


  getCartItemsPreorder() {
    this.dataService.getCartItems()
      .subscribe(
        (response: any) => {
          let ischeckPreorder = true;
          const cartItems = response.body.Patrons;
          cartItems.forEach((data:any) => {
            data.MealPayments.forEach((item:any) => {
              if (item.IsPreorder && ischeckPreorder) {
                ischeckPreorder = false;
              }
            });
          });
          this.router.navigate(['/dashboard/cart']);
        }
      )
  }

  setReceiptData(receiptData :any){
    this.receiptData = receiptData;
   }
 
   getReceiptData(){
     return this.receiptData;
   }
}



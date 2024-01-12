import { AppConfiguration } from './../app-configuration';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './../services/language/language.service';
import { DataService } from './../services/data/data.service';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../services/shared/shared.service';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert/alert.service';
import { EventService } from '../serviceEvent/event.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  FundraiserShow:boolean = false;
  firstPatronObj = [];
  allDistrictFeatureList = [];
  loadSpinner: any;
  havePatrons = true;
  viewPatrons: any;
  userMessages: any;
  cartCount: number;
  districtFeaturelist: any;
  userInfo: any;
  isARExpired;
  popUpShown = false;
  quikappsBaseUrl: string;
  ShowApplicationMessage: any;
  ShowCompletedAppPopup: any;
  ShowQAInfoPopup: any;
  IsDefaultMenuName:boolean;
  quikAppsMenuName:string;
  TabValid:boolean = false;
  criticalMessage:any =[];
  constructor(
    private dataService: DataService,
    private sharedService: SharedService,
    public loadingController: LoadingController,
    private router: Router,
    private nav: NavController,
    public alertController: AlertController,
    public languageService: LanguageService,
    public alertService: AlertService,
    private translate: TranslateService,
    private appConfiguration: AppConfiguration,
    private events: EventService,
  ) {
    this.quikappsBaseUrl = this.appConfiguration.quikappsBaseUrl;
  }

  ionViewWillEnter() {

    const studentData = {
      type: 'all',
      data: ''
    }
    localStorage.setItem('selectedPatron', JSON.stringify(studentData));
    this.presentLoadingWithOptions();
    this.getDistrictFeatureList();
    this.getCartItems();
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
        })
  }

  ngOnInit() {
    this.popUpShown = false;
    // this.events.subscribe('update district', (data) => {
    //   if(data == true) {
    //     this.getDistrictFeatureList();
    //   }
    // });
    const reqObject: any = {};
    reqObject.IncludeAlreadyRead = true;
    reqObject.IncludeInactive = true;
    reqObject.ForceRefresh = true;

    this.dataService.getUserMessages(reqObject)
      .subscribe(
        (response: any) => {
          this.criticalMessage = [];
          this.userMessages = response.body.Messages;
          this.userMessages.forEach(message => {

            if (message.Priority === 2 && message.Displayonlogin === true) {
              const date = new Date().toISOString();
              if(message.EndDate > date){
                this.criticalMessage.push(message);
                if(this.sharedService.firstLogin === true){
                  setTimeout(() => {
                    this.displayUrgentmessageAlert(message); 
                  }, 3000);
                 
                }
              }
              }
            
          });
          this.sharedService.firstLogin = false;
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  onDisplayLang() {
    this.languageService.displayLanguageAlert();
  }

  selectedStudentType(type, data) {
    if (data && !data.Active) {
      const msg = this.translate.instant('IS_Inactive_Patron_Content');
      this.alertService.infoAlert(msg);
    }
    const studentData = {
      type: type,
      data: data
    }
    localStorage.setItem('selectedPatron', JSON.stringify(studentData));
    this.sharedService.setselectPatronWithData(studentData);
    if(this.TabValid){
      if(this.FundraiserShow){
        this.router.navigate(['/dashboard/patron-detail']);
      }else{
        return;
      }  
    }else{
      this.router.navigate(['/dashboard/patron-detail']);
    }
    
  }
  getUserMessages() {
    this.sharedService.loading.next(false);
    const reqObject: any = {};
    reqObject.IncludeAlreadyRead = true;
    reqObject.IncludeInactive = true;
    reqObject.ForceRefresh = true;

    this.dataService.getUserMessages(reqObject)
      .subscribe(
        (response: any) => {
          this.userMessages = response.body.Messages;

          const priorityMsg = this.userMessages.filter((data) => {
            if (data.Priority == 2 && data.ReadDate == null && data.Displayonlogin == false) {
              return data;
            }
          })
          const unreadMsg = this.userMessages.filter((data) => {
            if (data.ReadDate == null) {
              return data;
            }
          })
          this.sharedService.messageCount.next(unreadMsg.length);
          if (priorityMsg.length > 0) {
            this.messageAlert(priorityMsg);
          }
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  getDistrictFeatureList() {
    this.sharedService.loading.next(true);
    this.dataService.getDistrictFeatureList()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.allDistrictFeatureList = response.body.Districts;
          this.getUserMessages();
          this.getUserInfo();
          this.getUserPatrons();
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  getUserPatrons() {
    this.sharedService.loading.next(true);
    this.dataService.getPatronList()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.viewPatrons = response.body.Patrons;
          this.sharedService.userPatronsList.next(response.body.Patrons);
          const firstPatronObj = this.viewPatrons[0];
          if (this.viewPatrons.length == 1) {
            const studentData = {
              type: 'individual',
              data: this.viewPatrons[0]
            }
            localStorage.setItem('selectedPatron', JSON.stringify(studentData));
          }
          if (this.viewPatrons.length > 0) {
            this.havePatrons = true;
            const districtFeaturelist = this.allDistrictFeatureList.filter((districtFeaturelist) => {
              if (districtFeaturelist.IntDistrictId == firstPatronObj.IntDistrictId) {
                return districtFeaturelist;
              }
            })
            this.sharedService.districtSettings.next(districtFeaturelist[0]);
            this.IsDefaultMenuName = districtFeaturelist[0].QuikApps.IsDefaultMenuName;
          if(this.IsDefaultMenuName === false){
            this.quikAppsMenuName = districtFeaturelist[0].QuikApps.MenuName;
          }else{
            this.quikAppsMenuName = this.translate.instant('meal_applications');
          }
          if(districtFeaturelist.length > 0){
            localStorage.setItem('districtFeaturelist', JSON.stringify(districtFeaturelist[0]));
            this.getTabData();
          }
            setTimeout(() => {
              this.goToQuikApps();
            }, 2000)
          } else {
            this.havePatrons = false;
            localStorage.setItem('dashboardRedirectPath', '/dashboard/home');
          }
          this.loadSpinner.dismiss();
        },
        (error) => {
          this.loadSpinner.dismiss();
          console.log(error);
        }
      )
  }

  getTabData() {
    
    const districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    if(districtFeaturelist.FeeSettings.Fundraiser || districtFeaturelist.FeeSettings.AllowGuest)
    {
      this.FundraiserShow=true
    }
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
    console.log("TabValid", this.TabValid);
    if(this.TabValid){
      if(!this.FundraiserShow){
        this.cartCount =0;
      }
      return;
    }else{
      if (tabData[0].showTab) {
        localStorage.setItem('dashboardRedirectPath', tabData[0].route);
      } else if (tabData[1].showTab) {
        localStorage.setItem('dashboardRedirectPath', tabData[1].route);
      } else {
        localStorage.setItem('dashboardRedirectPath', tabData[2].route);
      }
    }
    

  }

  getUserInfo() {
    this.sharedService.loading.next(true);
    this.dataService.getUserInfo()
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          this.isARExpired = response.body.AutoReplenishment.ShowExpireNotification;
          this.ShowApplicationMessage = response.body.QuikApps.ShowApplicationMessageSw;
          this.ShowCompletedAppPopup = response.body.QuikApps.ShowCompletedAppPopupSw;
          this.ShowQAInfoPopup = response.body.QuikApps.ShowQAInfoPopupSw;
          const userInfo = response.body;
          const ACHStatusCode = userInfo.ACHStatusCode;
          delete userInfo.ACHStatus;
          delete userInfo.APIStatus;
          delete userInfo.APIStatusReason;
          let selectedLangCode = localStorage.getItem('selectedLangCode');
          if(!selectedLangCode) {
            if (userInfo.IntLanguageId == 8) {
              this.translate.use('uz');
              this.languageService.langDir ='ltr';
            }else if(userInfo.IntLanguageId == 2) {
              this.translate.use('es');
              this.languageService.langDir ='ltr';
            }else if(userInfo.IntLanguageId == 3) {
              this.translate.use('ar');
              this.languageService.langDir ='rtl';
            }else if (userInfo.IntLanguageId === 4){
              this.translate.use('ja');
              this.languageService.langDir ='ltr';
            }else if (userInfo.IntLanguageId === 5){
              this.translate.use('ko');
              this.languageService.langDir ='ltr';
            }else if (userInfo.IntLanguageId === 6){
              this.translate.use('ru');
              this.languageService.langDir ='ltr';
            }else if (userInfo.IntLanguageId === 7){
              this.translate.use('zh');
              this.languageService.langDir ='ltr';
            } else {
              this.translate.use('en');
              this.languageService.langDir ='ltr';
            }
        } else {
          if (parseInt(selectedLangCode) === 8) {
            this.translate.use('uz');
            this.languageService.langDir ='ltr';
          }else if(parseInt(selectedLangCode) == 2) {
            this.translate.use('es');
            this.languageService.langDir ='ltr';
          }else if(parseInt(selectedLangCode) == 3) {
            this.translate.use('ar');
            this.languageService.langDir ='rtl';
          }else if (parseInt(selectedLangCode) === 4){
            this.translate.use('ja');
            this.languageService.langDir ='ltr';
          }else if (parseInt(selectedLangCode) === 5){
            this.translate.use('ko');
            this.languageService.langDir ='ltr';
          }else if (parseInt(selectedLangCode) === 6){
            this.translate.use('ru');
            this.languageService.langDir ='ltr';
          }else if (parseInt(selectedLangCode) === 7){
            this.translate.use('zh');
            this.languageService.langDir ='ltr';
          } else {
            this.translate.use('en');
            this.languageService.langDir ='ltr';
          }
        } 
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          const Account = ACHStatusCode.slice(0, -4);
          const las4Didgits = ACHStatusCode.substr(ACHStatusCode.length - 4);
          if (Account == "NSF_") {
            this.router.navigate(['/dashboard/badach-nsf-messages'], { queryParams: { type: 'nsf' } });
          } else if (Account == "UA_" || Account == "UR_" || Account == "UA" || Account == "UR") {
            this.router.navigate(['/dashboard/badach-nsf-messages'], { queryParams: { type: 'uaur', ccNum: las4Didgits } });
          } else if (Account == "CB_" || Account == "CB") {
            this.router.navigate(['/dashboard/badach-nsf-messages'], { queryParams: { type: 'cb', ccNum: las4Didgits } });
          }
          if (this.isARExpired === true && !this.popUpShown) {
            this.popUpShown = true;
            this.showARExpirePopup();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  showARExpirePopup() {
    const checkBoxLabel = this.translate.instant('AR_Expiry_Notify_Ignore');
    const close = this.translate.instant('close');
    const expiryButton = this.translate.instant('AR_Expiry_Button');
    const alert = this.alertController.create({
      header: this.translate.instant('AR_Expiry_Notify_Header'),
      message: this.translate.instant('AR_Expiry_Notify'),
      backdropDismiss: false,
      cssClass: 'AR_Expiry_cssClass',
      inputs: [
        {
          name: 'free reduced',
          type: 'checkbox',
          label: checkBoxLabel,
          value: 'AR_Expiry_Ignore'
        }
      ],
      buttons: [
        {
          text: expiryButton,
          handler: (data) => {
            if (data[0] == 'AR_Expiry_Ignore') {
              this.setClearARExpireStatus();
            }
            this.router.navigate(['/dashboard/auto-replenishment']);
          }
        },
        {
          text: this.translate.instant('close'),
          handler: (data) => {
            if (data[0] == 'AR_Expiry_Ignore') {
              this.setClearARExpireStatus();
            }
          }
        }
      ]
    });
    alert.then((res) => {
      res.present();
    });
  }

  setClearARExpireStatus() {
    this.dataService.clearARNotification()
      .subscribe(
        (response: any) => { },
        (error) => { }
      )
  }

  redirectTo() {
    this.router.navigate(['/dashboard/manage-patrons'], { queryParams: { page: 'add' } });
    // this.sharedService.pageHeaderTitle.next('Your Students');
  }

  async presentLoadingWithOptions() {
    this.loadSpinner = await this.loadingController.create({
      spinner: 'lines',
      message: this.translate.instant('please_wait'),
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await this.loadSpinner.present();
  }

  messageAlert(priorityMsg) {
    const msg = this.translate.instant('You_have') + priorityMsg.length + this.translate.instant('critical_messages')
    const alert = this.alertController.create({
      header: this.translate.instant('Warning'),
      message: msg,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('Go_to_messages'),
          handler: () => {
            this.router.navigate(['/dashboard/messages']);
          }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }

  displayUrgentmessageAlert(priorityMsg) {
    console.log("priorityMsg.MessageText", priorityMsg.MessageText)
    // const msg = this.translate.instant('You_have') + priorityMsg.length + this.translate.instant('critical_messages')
    const msg = priorityMsg.MessageText
    const alert = this.alertController.create({
      header: priorityMsg.MessageSubject,
      message: msg,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('ok'),
          // handler: () => {
          //   this.router.navigate(['/dashboard/messages']);
          // }
        }
      ]
    });

    alert.then((val) => {
      val.present();
    });
  }

  onGotoCart() {
    this.router.navigate(['/dashboard/cart']);
  }

  onLangChange() {
    this.languageService.displayLanguageAlert();
  }

  ngOnDestroy() {
    this.loadSpinner.dismiss();
  }

  goToQuikApps() {
    let alertNum: number;
    let header: string;
    let message: string;
    let buttonName: string;
    let redirectPath: string;
    // const quikappsAlert1 = localStorage.getItem('quikappsAlert1');
    // const quikappsAlert2 = localStorage.getItem('quikappsAlert2');
    // const quikappsAlert3 = localStorage.getItem('quikappsAlert3');
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (this.districtFeaturelist && !this.userInfo.ACHStatusCode) {
      if (this.districtFeaturelist.QuikApps.HasPortalLicense && this.userInfo.QuikApps.ApplicationMessage != "" && !this.userInfo.QuikApps.PatronsInVerification && this.ShowApplicationMessage) {
        alertNum = 1;
        header = this.translate.instant('Information');
        message = '<p>' + this.translate.instant('fr_meal_application_message1') + '</p><p>' + this.userInfo.QuikApps.ApplicationMessage + '</p><p>' + this.translate.instant('fr_meal_application_message1_sub') + '</p>';
        // buttonName = this.translate.instant('meal_applications');
        if(this.IsDefaultMenuName === false){
          buttonName = this.districtFeaturelist.QuikApps.MenuName;
        }else{
          buttonName = this.translate.instant('meal_applications');
        }
        redirectPath = 'freeReducedMealApplication';
        this.alert(header, message, alertNum, buttonName, redirectPath);
      } else if (this.districtFeaturelist.QuikApps.HasPortalLicense && this.userInfo.QuikApps.HasSignedApplications && !this.userInfo.QuikApps.PatronsInVerification && this.ShowCompletedAppPopup) {
        alertNum = 2;
        header = this.translate.instant('Information');
        message = '<p>' + this.translate.instant('view_completed_apps_message') + '</p><p>' + this.translate.instant('view_completed_apps_message_sub') + '</p>';
        buttonName = this.translate.instant('view_app');
        redirectPath = 'viewCompletedApplication';
        this.alert(header, message, alertNum, buttonName, redirectPath);
      } else if (this.districtFeaturelist.QuikApps.HasPortalLicense && !this.userInfo.QuikApps.HasSignedApplications && !this.userInfo.QuikApps.PatronsInVerification && this.ShowQAInfoPopup) {
        alertNum = 3;
        header = this.translate.instant('Information');
        message = '<p>' + this.translate.instant('fr_meal_application_message') + '</p><p>' + this.translate.instant('fr_meal_application_message_sub') + '</p>';

        if (this.userInfo.QuikApps.PaperApplicationLocation && this.userInfo.QuikApps.PaperApplicationURL) {
          message = message + '<p class="paper-app-msg">' + this.translate.instant('fr_paper_application_message') + '</p><p>'
            + this.translate.instant('fr_paper_application_message_type2') + '</p><p></p><p>' + this.userInfo.QuikApps.PaperApplicationLocation
            + '</p><p></p><p>' + this.translate.instant('fr_paper_application_link_prefix') + '</p><a class="FR-links" href="' + this.userInfo.QuikApps.PaperApplicationURL + '">'
            + this.userInfo.QuikApps.PaperApplicationURL + '</a>';
        }
        else if (this.userInfo.QuikApps.PaperApplicationLocation) {
          message = message + '<p class="paper-app-msg">' + this.translate.instant('fr_paper_application_message') + '</p><p>'
            + this.translate.instant('fr_paper_application_message_type1') + '</p><p>' + this.translate.instant('fr_paper_application_address_prefix')
            + '</p><p>' + this.userInfo.QuikApps.PaperApplicationLocation + '</p>';
        }
        else if (this.userInfo.QuikApps.PaperApplicationURL) {
          message = message + '<p class="paper-app-msg">' + this.translate.instant('fr_paper_application_message') + '</p><p>'
            + this.translate.instant('fr_paper_application_message_type1') + '</p><p></p><p>' + this.translate.instant('fr_paper_application_link_prefix')
            + '</p><a class="FR-links" href="' + this.userInfo.QuikApps.PaperApplicationURL + '">' + this.userInfo.QuikApps.PaperApplicationURL + '</a>';
        }
        else {
          message = message + '<p class="paper-app-msg">' + this.translate.instant('fr_paper_application_message') + '</p><p>'
            + this.translate.instant('fr_paper_application_message_type1')
        }
        if(this.IsDefaultMenuName === false){
          buttonName = this.districtFeaturelist.QuikApps.MenuName;
        }else{
          buttonName = this.translate.instant('meal_applications');
        }
        // buttonName = this.translate.instant('meal_applications');
        redirectPath = 'freeReducedMealApplication';
        this.alert(header, message, alertNum, buttonName, redirectPath);

      }
    }
  }

  alert(header: string, message: string, alertNum: number, buttonName: string, redirectPath: string) {

    const checkboxLabel = this.translate.instant('show_Popup');
    const alert = this.alertController.create({
      header: header,
      message: message,
      backdropDismiss: false,
      cssClass: 'free_reduced',
      inputs: [
        {
          name: 'free reduced',
          type: 'checkbox',
          label: checkboxLabel,
          value: 'termschecked'
        }
      ],
      buttons: [{
        text: this.translate.instant('cancel'),
        handler: (data) => {

          if (alertNum == 1 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "ApplicationMessage"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert1', 'true');
          } else if (alertNum == 2 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "CompletedApp"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert2', 'true');
          } else if (alertNum == 3 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "QAInfo"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert3', 'true');
          }
        }
      }, {
        text: buttonName.toUpperCase(),
        handler: (data) => {
          if (alertNum == 1 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "ApplicationMessage"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert1', 'true');
          } else if (alertNum == 2 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "CompletedApp"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert2', 'true');
          } else if (alertNum == 3 && data[0] == 'termschecked') {
            const reqObj = {
              "NotificationType": "QAInfo"
            }
            this.OnClearQuikappsNotification(reqObj);
            // localStorage.setItem('quikappsAlert3', 'true');
          }
          this.openQuikappsUrl(redirectPath)
        }
      }]
    });

    alert.then((res) => {
      res.present();
    })
  }

  openQuikappsUrl(type) {
    let url;
    const globals = JSON.parse(sessionStorage.getItem('globals'));
    if (type == 'freeReducedMealApplication') {
      url = this.quikappsBaseUrl + '/#/Mobiletoquickappslogin?mobile=true&mobiletoken=' + globals.ApiKey;
      // url = this.quikappsBaseUrl + '/#/quikapps?mobile=true&token=' + globals.ApiKey;
    } else if (type == 'shareBenefits') {
      url = this.quikappsBaseUrl + '/#/Mobiletoquickappslogin?mobileDisclosure=11&mobiletoken=' + globals.ApiKey;
      // url = this.quikappsBaseUrl + '/#/quikapps?mobileDisclosure=11&token=' + globals.ApiKey;
    } else if (type == 'viewCompletedApplication') {
      url = this.quikappsBaseUrl + '/#/Mobiletoquickappslogin?mobileViewApp=true&mobiletoken=' + globals.ApiKey;
      // url = this.quikappsBaseUrl + '/#/viewcompletedapplication?mobileViewApp=true&token=' + globals.ApiKey;
    }
    // window.open(url,'_blank')
    this.sharedService.openUrl(url);
  }

  OnClearQuikappsNotification(reqObj) {
    this.dataService.ClearQuikappsNotification(reqObj)
      .subscribe(
        (response: any) => {

        },
        (error) => {
          console.log(error);
        }
      )
  }

}


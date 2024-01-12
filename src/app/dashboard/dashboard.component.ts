import { AlertService } from 'src/app/services/alert/alert.service';
import { LanguageService } from './../services/language/language.service';
import { AppConfiguration } from './../app-configuration';
import { PrivacyPage } from './../privacy/privacy.page';
import { AuthService } from './../auth/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, Platform, AlertController, NavController } from '@ionic/angular';
import { SharedService } from '../services/shared/shared.service';
import { TermsPage } from '../terms/terms.page';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { HelpPage } from '../help/help.page';
import { DataService } from '../services/data/data.service';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  pageHeader: string;
  private event_url: string
  appversion: any;
  quikappsBaseUrl: string;
  userPatronList: any;
  districtFeaturelist: any;
  userInfo: any;
  data;
  activePatronsFlag: any;
  paymentMethods: any;
  popHeading;
  popdescription;
  messageCount: number;
  mmoUrl: string;
  redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
  activemenu: any = 'home'
  IsDefaultMenuName:boolean;
  quikAppsMenuName:string;
  constructor(
    private dataService: DataService,
    private menu: MenuController,
    private sharedService: SharedService,
    private router: Router,
    private authService: AuthService,
    public modalController: ModalController,
    private appConfiguration: AppConfiguration,
    private appVersion: AppVersion,
    public languageService: LanguageService,
    private alertController: AlertController,
    private translate: TranslateService,
    private platform: Platform,
    private alertService: AlertService,
    private iab: InAppBrowser,
    private navCtrl: NavController,
  ) {
    this.event_url = this.appConfiguration.event_url;
    this.quikappsBaseUrl = this.appConfiguration.quikappsBaseUrl;
    this.appversion = this.appConfiguration.app_version;
    this.mmoUrl = this.appConfiguration.mmoUrl;
    const version = this.appversion.split('.');
    this.appversion = version[0] + '.' + version[1];
  
  }

  
  ngOnInit() {
    this.sharedService.appPhase.next('dashboard');
    this.sharedService.pageHeaderTitle.subscribe((title: string) => {
      this.pageHeader = title;
    })
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.sharedService.districtSettings.subscribe(value => {
      if (value && value !== 'list') {
        this.districtFeaturelist = value;
        // this.quikAppsMenuName = '';
          this.IsDefaultMenuName = this.districtFeaturelist.QuikApps.IsDefaultMenuName;
          if(this.IsDefaultMenuName === false){
            this.quikAppsMenuName = this.districtFeaturelist.QuikApps.MenuName;
          }else{
            this.quikAppsMenuName = this.translate.instant('meal_applications');
          }
        console.log(value)
      }else{
        this.quikAppsMenuName = this.translate.instant('meal_applications');
      }
    });
  }

  ionViewWillEnter() {
    this.sharedService.userPatronsList.subscribe((userPatronList) => {
      this.userPatronList = userPatronList;
      console.log(userPatronList);
      if(userPatronList.length === 0){
        this.quikAppsMenuName = this.translate.instant('meal_applications');
      }
      const activePatrons = this.userPatronList.filter((data) => {
        if (data.Active) {
          return data;
        }
      })
      if (activePatrons && activePatrons.length > 0) {
        this.activePatronsFlag = false;
      } else {
        this.activePatronsFlag = true;
      }
    })
    this.languageService.setLanguage();
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.sharedService.messageCount.subscribe((messageCount) => {
      this.messageCount = messageCount;
    })
    
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  menuOpened() {
    this.districtFeaturelist = JSON.parse(localStorage.getItem('districtFeaturelist'));
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
  }
  autoReplenishment() {
    this.activemenu = 'AutoReplenishment'
    this.sharedService.loading.next(true);
    this.dataService.getPaymentMethods()
      .subscribe(
        (response: any) => {
          this.paymentMethods = response.body.PaymentMethods;
          if (this.paymentMethods.length > 0) {
            this.redirectTo('AutoReplenishment')
          } else {
            this.redirectToAddPayment();
          }
          this.sharedService.loading.next(false);
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      )
  }

  redirectToAddPayment() {

    const alert = this.alertController.create({
      header: this.translate.instant('AR_Error'),
      message: this.translate.instant('AR_add_payment_to_setup'),
      buttons: [
        {
          text: this.translate.instant('Manage_Payment_Methods'),
          handler: () => {
            this.sharedService.pageHeaderTitle.next('Payment Methods');
            this.router.navigate(['/dashboard/manage-payment-methods'], { queryParams: { page: 'add' } });
          }
        }
      ]
    });
    alert.then((res) => {
      res.present();
    });
  }

  redirectTo(value) {
    this.activemenu = value;
    if (value == 'Home') {
      this.sharedService.pageHeaderTitle.next('Home');
      this.router.navigate(['/dashboard/home']);
      // this.redirectToDashboard = localStorage.getItem('dashboardRedirectPath');
      // this.router.navigate([this.redirectToDashboard]);
    } else if (value == 'Messages') {
      this.sharedService.pageHeaderTitle.next('Messages');
      this.router.navigate(['/dashboard/messages']);
    } else if (value == 'Notifications') {
      this.sharedService.pageHeaderTitle.next('Notifications');
      this.router.navigate(['/dashboard/notifications']);
    } else if (value == 'YourProfile') {
      this.sharedService.pageHeaderTitle.next('Your Profile');
      this.router.navigate(['/dashboard/manage-profile']);
    } else if (value == 'SecureAccount') {
      this.sharedService.pageHeaderTitle.next('Secure Account');
      this.router.navigate(['/dashboard/security-questions']);
    } else if (value == 'YourStudents') {
      this.sharedService.pageHeaderTitle.next('Your Students');
      this.router.navigate(['/dashboard/manage-patrons']);
    } else if (value == 'PaymentMethods') {
      this.sharedService.pageHeaderTitle.next('Payment Methods');
      this.router.navigate(['/dashboard/manage-payment-methods']);
    } else if (value == 'AutoReplenishment') {
      this.data = {
        "ARType": 'autoreplenishment',
        "PatronDetails": '',
        "patronIndex": ''

      }
      this.sharedService.setDashboardAR(this.data);
      this.sharedService.pageHeaderTitle.next('Auto Replenishment');
      this.router.navigate(['/dashboard/auto-replenishment']);
    } else if (value == 'MealRestrictions') {

      let selectedPatron = JSON.parse(localStorage.getItem('selectedPatron'))
      if (selectedPatron != '' && selectedPatron.type == 'all') {
        this.sharedService.pageHeaderTitle.next('MealRestrictions');
        const studentData = {
          type: 'all',
          data: ''
        }
        localStorage.setItem('selectedPatron', JSON.stringify(studentData));
      }
      this.router.navigate(['/dashboard/meal-restrictions']);
    } else if (value == 'digitalid') {
      this.sharedService.pageHeaderTitle.next('Digital ID');
      this.router.navigate(['/dashboard/digital-id']);
    } else if (value == 'preordermeals') {
      let globals: any = JSON.parse(sessionStorage.getItem('globals'));
      const reqObj = {
        "Token": globals.ApiKey,
        "Env": this.appConfiguration.environment.toLowerCase()
      }
      this.sharedService.loading.next(true);
      this.dataService.GetValidateUser(reqObj)
        .subscribe(
          (response: any) => {
            this.sharedService.loading.next(false);
            if (!response.body.Status) {
              const url = this.mmoUrl + '?Token=' + globals.ApiKey + '&Env=' + this.appConfiguration.environment;
              this.sharedService.openUrl(url);
            } else if (response.body.Status) {
              let message;
              if (response.body.Errors[0].Object == 'District') {
                message = this.translate.instant('dist_err')
              } else if (response.body.Errors[0].Object == 'School') {
                message = this.translate.instant('school_err')
              }
              this.alertService.failureToast(message);
            }
          },
          (error) => {
            this.sharedService.loading.next(false);
            console.log(error);
          }
        )
    } else if (value == 'PaymentHistory') {
      this.sharedService.pageHeaderTitle.next('Payment History');
      this.router.navigate(['/dashboard/payment-history']);
    } else if (value == 'Reports') {
      this.sharedService.pageHeaderTitle.next('Reports');
      this.router.navigate(['/dashboard/reports']);
    } else if (value == 'Help') {
      this.openHelpModal();
    } else if (value == 'Privacy') {
      this.openPrivacyModal();
    } else if (value == 'Terms') {
      this.openTermsModal();
    } else if (value == 'RateOurApp') {
      let url;
      if (this.platform.is('android')) {
        url = "https://play.google.com/store/apps/details?id=com.i3v.edu.psc&hl=en";
        this.sharedService.openSystemBrowser(url);
      } else {
        url = "https://apps.apple.com/us/app/payschools-central/id1614493880?ls=1";
        this.sharedService.openUrl(url);
      }
    } else if (value == 'logout') {
      this.authService.logout('logout');
    }

  }

  showAlert() {
    //   const message = this.translate.instant('cart_warning4');
    //   if(this.districtFeaturelist.UsePreOrderBalance === true) {
    //   const alert = this.alertController.create({
    //     header: this.translate.instant('warning_cart_msg1'),
    //     message: message,
    //     buttons: [
    //       {
    //         text: this.translate.instant('no'),
    //         cssClass: 'secondary',
    //         handler: (blah) => {
    //           console.log(message);
    //           let globals: any = JSON.parse(sessionStorage.getItem('globals'));
    //           const reqObj = {
    //             "Token": globals.ApiKey,
    //             "Env": this.appConfiguration.environment.toLowerCase()
    //           }
    //           this.sharedService.loading.next(true);
    //           this.dataService.GetValidateUser(reqObj)
    //             .subscribe(
    //               (response: any) => {
    //                 this.sharedService.loading.next(false);
    //                 if (!response.body.Status) {
    //                   const url = this.mmoUrl + '?Token=' + globals.ApiKey + '&Env=' + this.appConfiguration.environment;
    //                   this.sharedService.openUrl(url);
    //                 } else if (response.body.Status) {
    //                   let message;
    //                   if (response.body.Errors[0].Object == 'District') {
    //                     message = this.translate.instant('dist_err')
    //                   } else if (response.body.Errors[0].Object == 'School') {
    //                     message = this.translate.instant('school_err')
    //                   }
    //                   this.alertService.failureToast(message);
    //                 }
    //               },
    //               (error) => {
    //                 this.sharedService.loading.next(false);
    //                 console.log(error);
    //               }
    //             )
    //         }
    //       }, {
    //         text: this.translate.instant('yes'),
    //         role: 'cancel',
    //         handler: () => {
    //           this.redirectTo('Home');
    //         }
    //       }
    //     ],
    //     cssClass: 'cartwarning'
    //   });

    //   alert.then((val) => {
    //     val.present();
    //   });
    // } else {
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));
    const url = this.mmoUrl + '?Token=' + globals.ApiKey + '&Env=' + this.appConfiguration.environment;
    // this.sharedService.openUrl(url);
    if(this.platform.is('ios')){
      // this.iab.create(url,'_system')
      let openBrowser = this.iab.create(url, '_blank');
      if(this.router.url === '/dashboard/cart'){
        this.navCtrl.navigateRoot('/dashboard/home');
      }
      openBrowser.on('exit').subscribe(event => {
          this.navCtrl.navigateRoot('/dashboard/cart');
      });
    } else {
      // window.open(url, '_system');
      var ref = this.iab.create(url,'_blank');
      if(this.router.url === '/dashboard/cart'){
        this.navCtrl.navigateRoot('/dashboard/home');
      }
      ref.on('exit').subscribe(event => {
          this.navCtrl.navigateRoot('/dashboard/cart');
      });
      ref.show();
    }
  }
  //}

  async openHelpModal() {
    const modal = await this.modalController.create({
      component: HelpPage
    });
    return await modal.present();
  }

  async openTermsModal() {
    const modal = await this.modalController.create({
      component: TermsPage
    });
    return await modal.present();
  }

  async openPrivacyModal() {
    let url;
    const selectedLang = this.getValidLangIdToDisplay();
    if (selectedLang == 2) {
      url = "https://www.i3verticals.com/wp-content/uploads/2020/03/PrivacyPolicy.pdf"
    } else {
      url = "https://www.i3verticals.com/wp-content/uploads/2020/03/PrivacyPolicy.pdf"
    }
    if (this.platform.is('android')) {
        // window.open(url, '_system');
        var ref = this.iab.create(url,'_system');
        ref.show();
    } else {
      this.sharedService.openUrl(url);
    }
  }

  openUrl() {
    this.sharedService.openUrl(this.event_url);
  }

  getValidLangIdToDisplay() {
    console.log('here')
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    let globals: any = JSON.parse(sessionStorage.getItem('globals'));
    console.log(globals);
    if (globals != null) {
      let selectedLangCode = localStorage.getItem('selectedLangCode');
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
    return selectedLang;
  }

  openQuikappsUrl(type) {
    let url;
    const globals = JSON.parse(sessionStorage.getItem('globals'));
    // this.quikappsBaseUrl = 'http://localhost:4200'; // quikapps local
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
    // window.open(url,'_blank') // quikapps local
    if(this.platform.is('ios')){
      this.iab.create(url,'_blank')
    } else {
      // window.open(url, '_system');
     
      var ref = this.iab.create(url,'_blank');
      ref.show();
    }
    // this.sharedService.openUrl(url);
  }

}

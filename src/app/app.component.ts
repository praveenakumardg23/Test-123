import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { TermsPage } from './terms/terms.page';
import { PrivacyPage } from './privacy/privacy.page';
import { AuthService } from './auth/auth.service';
import { AppConfiguration } from './app-configuration';
import { LanguageService } from './services/language/language.service';

import {
  Router,
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router'
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { SharedService } from './services/shared/shared.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  loading = false;
  modalClass:string;
  accountVerification: string;
  appversion: any;
  private event_url: string
  private previousUrl: string = undefined;
  private currentUrl: string = undefined;
  direction:any;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private sharedService: SharedService,
    private deeplinks: Deeplinks,
    private appVersion: AppVersion,
    public modalController: ModalController,
    private authService: AuthService,
    private keyboard: Keyboard,
    private appConfiguration: AppConfiguration,
    private translate: TranslateService,
    private zone: NgZone,
    public languageService: LanguageService,
  ) {
    this.platform.ready().then(() => {
      document.addEventListener('backbutton', () => {
      }, false);
      if(this.platform.is('ios')){
        this.statusBar.hide();
      }
      this.direction = this.languageService.langDir;


     

    
      // if(this.platform.isRTL){
      //   this.direction = 'rtl';
      // }else{
      //   this.direction = 'ltr';
      // }
      setTimeout(() => {
        this.splashScreen.hide();
      }, 1000);
    })
    this.translate.setDefaultLang('en');
    this.event_url = this.appConfiguration.event_url;
    this.initializeApp();
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    })
    this.sharedService.loading.subscribe((status) => {
      if (status) {
        this.loading = status;
      } else {
        this.loading = status;
      }
    })

    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
        sessionStorage.setItem('previousPath', this.previousUrl);
        sessionStorage.setItem('currentPath', this.currentUrl);
      };
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if(this.platform.is('cordova')){
        this.deeplinks.route({
          '/' : '/',
       })
       .subscribe(match => {
         const url = JSON.stringify(match.$link.url);
          this.accountVerification = this.getParamValueQueryString(url);
          if (this.accountVerification) {
            localStorage.removeItem('activationCode');
            localStorage.setItem('activationCode', JSON.stringify(this.accountVerification));
            this.zone.run(async () => {
              await this.router.navigate(['reset-password']);
            })
          }
        }, nomatch => {
          console.error('Got a deeplink that didn\'t match', nomatch);
        });
        this.keyboard.hideFormAccessoryBar(false);
      }
    });
  }

  ngOnInit() {
    const headerTitle = sessionStorage.getItem('headerTitle');
    if (headerTitle) {
      this.sharedService.pageHeaderTitle.next(headerTitle);
    }
    if(this.platform.is('cordova')){
      this.appVersion.getVersionNumber().then((version) => {
        this.appversion = version;
      });
    }
   
    this.sharedService.pageHeaderTitle.subscribe((title) => {
      sessionStorage.setItem('headerTitle', title)
    })
  }

  ionViewDidEnter() {
    document.addEventListener("backbutton", function (e) {
    }, false);
  }
  
  getParamValueQueryString(urlParamName) {
    console.log(urlParamName);
    const url = JSON.parse(urlParamName);
    let paramValue;
    if (url.includes('?')) {
      const httpParams = new HttpParams({ fromString: url.split('?')[1] });
      paramValue = httpParams.get('i3vConfirmAccount');
    }
    return paramValue;
  }


  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true
    }
    if (event instanceof NavigationEnd) {
      this.loading = false
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false
    }
    if (event instanceof NavigationError) {
      this.loading = false
    }
  }
  // redirectTo(value) {
  //   if (value == 'Home') {
  //     this.sharedService.pageHeaderTitle.next('Home');
  //     this.router.navigate(['/dashboard/home']);
  //   } else if (value == 'Messages') {
  //     this.sharedService.pageHeaderTitle.next('Messages');
  //     this.router.navigate(['/dashboard/messages']);
  //   } else if (value == 'Notifications') {
  //     this.sharedService.pageHeaderTitle.next('Notifications');
  //     this.router.navigate(['/dashboard/notifications']);
  //   } else if (value == 'YourProfile') {
  //     this.sharedService.pageHeaderTitle.next('Your Profile');
  //     this.router.navigate(['/dashboard/manage-profile']);
  //   } else if (value == 'SecureAccount') {
  //     this.sharedService.pageHeaderTitle.next('Secure Account');
  //     this.router.navigate(['/dashboard/security-questions']);
  //   } else if (value == 'YourStudents') {
  //     this.sharedService.pageHeaderTitle.next('Your Students');
  //     this.router.navigate(['/dashboard/manage-patrons']);
  //   } else if (value == 'PaymentMethods') {
  //     this.sharedService.pageHeaderTitle.next('Payment Methods');
  //     this.router.navigate(['/dashboard/manage-payment-methods']);
  //   } else if (value == 'AutoReplenishment') {
  //     this.sharedService.pageHeaderTitle.next('Auto Replenishment');
  //     this.router.navigate(['/dashboard/auto-replenishment']);
  //   } else if (value == 'PaymentHistory') {
  //     this.sharedService.pageHeaderTitle.next('Payment History');
  //     this.router.navigate(['/dashboard/payment-history']);
  //   } else if (value == 'Reports') {
  //     this.sharedService.pageHeaderTitle.next('Reports');
  //   } else if (value == 'Privacy') {
  //     this.openPrivacyModal();
  //   } else if (value == 'Terms') {
  //     this.openTermsModal();
  //   } else if (value == 'logout') {
  //     this.authService.logout('logout');
  //   }

  // }

  // async openTermsModal() {
  //   const modal = await this.modalController.create({
  //     component: TermsPage
  //   });
  //   return await modal.present();
  // }

  // async openPrivacyModal() {
  //   const modal = await this.modalController.create({
  //     component: PrivacyPage
  //   });
  //   return await modal.present();
  // }

  // openUrl() {
  //   this.sharedService.openUrl(this.event_url)
  // }
}

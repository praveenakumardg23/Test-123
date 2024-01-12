import { HelpPage } from './../help/help.page';
import { AlertService } from './../services/alert/alert.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TabHeaderService } from '../services/tab-header/tab-header.service';
import { NgForm } from '@angular/forms';
import { FingerprintService } from './../auth/fingerprint/fingerprint.service';

import { DataService } from '../services/data/data.service';
import { Storage } from '@ionic/storage';
import { SharedService } from '../services/shared/shared.service';
import { Platform, AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { TermsPage } from '../terms/terms.page';
import { PrivacyPage } from '../privacy/privacy.page';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AppConfiguration } from '../app-configuration';
import { GlobalMessagesPage } from '../global-messages/global-messages.page';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public type = 'password';
  public showPass = false;
  private fingerAuthToken: string;
  public username: string;
  public Username: string;
  isFingerPrintEnabled = false;
  appversion: any;
  mobileVersion: any;
  buildNumber: string;
  screenName = 'login';
  activeTab: number;
  userPassword: any;
  saveUserCredentials = false;
  saveUserData = false;

  constructor(
    private tabHeaderService: TabHeaderService,
    private dataService: DataService,
    private storage: Storage,
    private router: Router,
    private sharedService: SharedService,
    private platform: Platform,
    public modalController: ModalController,
    private fingerprintService: FingerprintService,
    private appVersion: AppVersion,
    private alertService: AlertService,
    private translate: TranslateService,
    private alertController: AlertController,
    private appConfiguration: AppConfiguration,
    private nativeStorage: NativeStorage,
    private iab: InAppBrowser) {
    this.tabHeaderService.activeTab.next(0);
    this.appversion = this.appConfiguration.app_version;
    const version = this.appversion.split('.');
    // console.log(version);
    this.mobileVersion = version[0] + '.' + version[1];
    this.buildNumber = version[3];
    // this.platform.pause.subscribe(() => {
    // });

    // this.platform.resume.subscribe(() => {
    // });
  }

  ngOnInit() {
    this.storage.create();
    // this.globalMessages();
    if(this.platform.is('cordova')){
      this.getUserCredentials();
    }
    
    // this.nativeStorage.getItem('userCredentials').then(
    //   (data) => {
    //   this.Username = data.username;
    //   this.userPassword = data.password;
    //          },
    //   error => console.error(error)
    // );

    if (this.platform.is('ios')) {
      this.storage.get('username')
      .then(data => {
        this.username = data;
      });
    }

    // this.appVersion.getVersionNumber().then((version) => {
    //   this.appversion = version;
    // });

    this.tabHeaderService.activeTab.subscribe((tabnum) => {
      this.activeTab = tabnum;
      if (tabnum === 0) {
        this.screenName = 'login';
      } else {
        this.screenName = 'register';
      }
    });
  }

  ionViewWillEnter() {
    localStorage.removeItem('quikappsAlert3');
    localStorage.removeItem('quikappsAlert2');
    localStorage.removeItem('quikappsAlert1');
    localStorage.removeItem('districtFeaturelist');
    localStorage.removeItem('selectedPatron');
    this.getVersion();
    if(this.platform.is('cordova')){
      this.getUserCredentials();
    }

    // this.nativeStorage.getItem('userCredentials').then(
    //   (data) => {
    //   this.Username = data.username;
    //   this.userPassword = data.password;
    //          },
    //   error => console.error(error)
    // );

    if (this.platform.is('ios')) {
      this.storage.get('fingerAuthToken')
      .then(data => {
        this.fingerAuthToken = data;
        if (this.fingerAuthToken) {
          this.isFingerPrintEnabled = true;
        } else {
          this.isFingerPrintEnabled = false;
        }
        console.log('Biometric in Login Screen for IOS: ', this.fingerAuthToken);
    });
      }


    this.nativeStorage.getItem('fingerAuthToken')
      .then(
        (data) => {
          // console.log("get Biometric in Login Screen : ", data.biometric);
          this.fingerAuthToken = data.biometric;
          if (this.fingerAuthToken) {
            this.isFingerPrintEnabled = true;
          } else {
            this.isFingerPrintEnabled = false;
          }
        },
        error => console.error(error)
      );
    this.tabHeaderService.activeTab.next(0);
    this.sharedService.isGuestUser = false;
    // swipeBackEnabled: false
  }

  ionViewWillUnload() {
    this.platform.pause.unsubscribe();
    this.platform.resume.unsubscribe();
  }
  getUserCredentials() {
    this.nativeStorage.getItem('userCredentials').then(
      (data) => {
      this.Username = data.username;
      this.userPassword = data.password;
             },
      error => console.error(error)
    );
    if (this.platform.is('ios')) {
      this.storage.get('userCredentials')
      .then(data => {
        this.Username = data.username;
        this.userPassword = data.password;
      });
    }
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
    if (selectedLang === 2) {
      url = 'http://www.i3verticals.com/wp-content/uploads/2020/03/PrivacyPolicy.pdf';
    } else {
      url = 'http://www.i3verticals.com/wp-content/uploads/2020/03/PrivacyPolicy.pdf';
    }
    if (this.platform.is('android')) {
      // window.open(url, '_system');
      var ref = this.iab.create(url,'_system');
      ref.show();
    } else {
      this.sharedService.openUrl(url);
    }
  }

  async openHelpModal() {
    const modal = await this.modalController.create({
      component: HelpPage
    });
    return await modal.present();
  }

  getValidLangIdToDisplay() {
    let selectedLang;
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const globals: any = JSON.parse(sessionStorage.getItem('globals'));

    if (globals != null) {
      const selectedLangCode = sessionStorage.getItem('selectedLangCode');
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

  globalMessages() {
    const reqObj = {
      CategoryType: 'C'
    };
    this.dataService.getGlobalMessages(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          const messages = response.body.Messages;
          if (messages.length > 0) {
            // this.globalMessageAlert(messages, 0);
            if (this.platform.is('android')) {
              if(response.body.Messages[0].ShowForAndroid){
                this.globalpopup(messages);
              }
              
            }else if(this.platform.is('ios')){
              if(response.body.Messages[0].ShowForIOS){
                this.globalpopup(messages);
              }
              
            }
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  switchTo(page, param?: any) {
    if (param) {
      this.screenName = page;
      if (this.screenName === 'login') {
        this.router.navigate(['login']);
      } else {
        this.router.navigate(['register']);
      }
    } else {
      localStorage.setItem('isGuestCheckout',  'true');
      this.router.navigate([page]);
    }
  }

  onLogin(formData: NgForm) {
    localStorage.removeItem('selectedLangCode');
    this.sharedService.loading.next(true);
    const payload = formData.value;
    this.dataService.login(payload).subscribe((response: any) => {
      this.sharedService.loading.next(false);
      if (response.body.APIStatus === 'Success') {
        this.sharedService.firstLogin = true;
        sessionStorage.setItem('globals', JSON.stringify(response.body));
        sessionStorage.setItem('nextStep', JSON.stringify(response.body.NextStep));
        localStorage.setItem('isGuestCheckout',  'false');
        this.fingerprintService.redirectTo(response);
        if (this.saveUserData) {
          this.saveCredentials();
        }
        if (this.fingerAuthToken == null) {
          if (this.platform.is('ios')) {
            this.storage.set('username', formData.value.username);
          }
          this.nativeStorage.setItem('username', { username: formData.value.username })
            .then(
              () => console.log('Stored UserName!'),
              error => console.error('Error storing item', error)
            );
        }
        if (this.saveUserCredentials === true) {
          this.nativeStorage.setItem('userCredentials', { username: formData.value.username , password: formData.value.password });
          if (this.platform.is('ios')) {
            this.storage.set('userCredentials', { username: formData.value.username , password: formData.value.password });
          }
        }
        setTimeout(() => {
          if (this.platform.is('android')) {
            let isBiometricRemoved = localStorage.getItem("isBiometricRemoved");
            if(isBiometricRemoved === "true"){
              this.fingerAuthToken = null;
            }
            if (this.fingerAuthToken == null) {
              // this.storage.set('username', formData.value.username);
              this.fingerprintService.fingerPrintForAndroid(payload, this.fingerAuthToken, response);
            }
            // else {
            //   this.fingerprintService.redirectTo(response);
            // }
          } else if (this.platform.is('ios')) {
            if (this.fingerAuthToken == null) {
              // this.storage.set('username', formData.value.username);
              this.fingerprintService.fingerPrintForiOS(payload, this.fingerAuthToken, response);
            }
            // else {
            //   this.fingerprintService.redirectTo(response);
            // }
          }
          // else {
          //   this.fingerprintService.redirectTo(response);
          // }
        }, 5000);
      } else {
        if(response.body.PEProcessingMessages[0].trim()==='Password has expired'){
          const msg = this.translate.instant('expired_password');
          this.warningMessageAlert(msg, true);          
        } else {
          const msg = this.translate.instant('login_error');
          this.alertService.failureToast(msg);
          // this.warningMessageAlert(msg, false);  
        }
      }
    });
  }

  saveCredentials() {
    this.saveUserCredentials = true;
  }

  onLoginWithFingerPrint() {
    localStorage.removeItem('selectedLangCode');
    if (this.platform.is('ios')) {
      this.storage.get('username')
      .then(data => {
        this.username = data;
        this.fingerprintService.verifyIOS(this.username, this.fingerAuthToken);
        setTimeout(()=>{
           this.storage.get('iosBiometricRemoved')
           .then(data =>{
            if(data === "true"){
              this.fingerAuthToken = null;
              this.isFingerPrintEnabled = false;
            }
           });   
          },3000);
      });
    }

    this.nativeStorage.getItem('username').then(
      (data) => {
        this.username = data.username;
        if (this.platform.is('android')) {
          this.fingerprintService.decrypt(this.username, this.fingerAuthToken);
          setTimeout(()=>{
            let isBiometricRemoved = localStorage.getItem('isBiometricRemoved');
            if(isBiometricRemoved === "true"){
              this.fingerAuthToken = null;
              this.isFingerPrintEnabled = false;
            }
          },3000);
        }
        // else if (this.platform.is('ios')) {
        //   this.fingerprintService.verify(this.username, this.fingerAuthToken);
        // }
      }, error => {
        console.error(error);});
  }

  // setTabStatus(step) {
  //   this.fingerprintService.setTabStatus(step);
  // }

  showPassword() {
    this.showPass = !this.showPass;
    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }

  onForgotPassowrd() {
    this.tabHeaderService.activeTab.next(10);
    this.router.navigate(['/forgot-password']);
  }

  openUrl() {
    this.sharedService.openUrl('https://i3education.org/');
  }

  processemail(text) {
    if (text) {
      this.Username = text.trim().toString();
    }
  }

  globalMessageAlert(messages, i) {
    const message = messages[i];
    const alert = this.alertController.create({
      header: this.translate.instant('Global_Message'),
      subHeader: message.MessageSubject,
      message: message.MessageText,
      backdropDismiss: false,
      buttons: [{
        text: this.translate.instant('ok'),
        handler: () => {
          if (i < (messages.length - 1)) {
            const index = i + 1;
            this.globalMessageAlert(messages, index);
          }
        }
      }]
    });

    alert.then((res) => {
      res.present();
    });
  }

  async globalpopup(globalMessage) {
    const modal = await this.modalController.create({
      component: GlobalMessagesPage,
      componentProps: {
        globalMessage
      },
      cssClass: 'message-content'
    });
    await modal.present();
  }

  getVersion() {
    
    this.sharedService.loading.next(true);
    const reqObj = {
      Application: 'PSC-Mobile',
      BuildNumber: this.buildNumber,
      DeviceType: this.platform.is('ios') ? 'IOS' : 'Android'
    };
    this.dataService.getVersion(reqObj)
      .subscribe(
        (response: any) => {
          this.sharedService.loading.next(false);
          if (response.body.ShowPopup) {
            this.applicationUpdatePopup(response.body);
          }
          if(response.body.ShowGlobalMessage){
            this.globalMessages();
          }
        },
        (error) => {
          this.sharedService.loading.next(false);
          console.log(error);
        }
      );
  }

  applicationUpdatePopup(response) {
    let url;
    url = response.ApplicationURL;

    const alert = this.alertController.create({
      header: this.translate.instant('update_head'),
      message: response.Message,
      backdropDismiss: false,
      buttons: [
        {
          text: this.translate.instant('UPDATE'),
          role: 'update',
          cssClass: 'primary',
          handler: () => {
            if(this.platform.is('ios')){
              this.iab.create(url,'_system')
            } else {
              window.open(url, '_system');
            }
             return false;
          }
        }
      ],
      // backdropDismiss: false
    });
    alert.then((val) => {
      val.present();
    });
  }
  opensociallinks(url) {
    if(this.platform.is('ios')){
      this.iab.create(url,'_system')
    } else {
      window.open(url, '_system');
    }
    // window.open(url, '_blank');
  }

  warningMessageAlert(message, isExpired) {
    if(isExpired){
      const alert = this.alertController.create({
        header: this.translate.instant('Information'),
        message: message,
        backdropDismiss: true,
        buttons: [{
          text: this.translate.instant('reset_password_btn_text'),
          handler: () => {
            this.tabHeaderService.activeTab.next(10);
            this.router.navigate(['/forgot-password']);
          }
        }]
      });
  
      alert.then((res) => {
        res.present();
      });
    } else {
      const alert = this.alertController.create({
        header: this.translate.instant('Information'),
        message: message,
        backdropDismiss: true,
        buttons: [{
          text: this.translate.instant('cancel'),
          handler: () => {
          }
        }]
      });
  
      alert.then((res) => {
        res.present();
      });
    }
  }
}
